package com.finaltest

import android.content.res.Configuration
import android.os.Build
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.adster.sdk.mediation.*
import com.facebook.react.bridge.Arguments
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.events.RCTEventEmitter

class BannerAdViewManager : SimpleViewManager<FrameLayout>() {
  companion object {
    private const val TAG = "RNBannerAdView"
  }

  override fun getName() = "RNBannerAdView"

  override fun createViewInstance(ctx: ThemedReactContext): FrameLayout {
    Log.d(TAG, "🎯 createViewInstance called")
    // Use WRAP_CONTENT height so we can measure and resize below
    return FrameLayout(ctx).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    }
  }

  //–– Props storage ––
  private var placementId: String? = null
  private var mode: String = "anchored"
  private var inlineWidthDp: Int? = null
  private var orientation: String = "auto"    // ← new

  @ReactProp(name = "placementId")
  fun setPlacementId(view: FrameLayout, pid: String) {
    placementId = pid
    Log.d(TAG, "🎯 placementId set: $pid — loading banner")
    loadAdaptiveBanner(view)
  }

  @ReactProp(name = "mode")
  fun setMode(view: FrameLayout, modeStr: String) {
    mode = modeStr.lowercase()
    Log.d(TAG, "🎯 mode set: $mode")
    // don't load here — wait for placementId or orientation change
  }

  @ReactProp(name = "inlineWidthDp")
  fun setInlineWidthDp(view: FrameLayout, widthDp: Int) {
    inlineWidthDp = widthDp
    Log.d(TAG, "🎯 inlineWidthDp set: ${widthDp}dp")
  }

  /** New prop: "auto" (default), "portrait" or "landscape" */
  @ReactProp(name = "orientation")
  fun setOrientation(view: FrameLayout, orient: String) {
    orientation = orient.lowercase()
    Log.d(TAG, "🎯 orientation set: $orientation")
    loadAdaptiveBanner(view)
  }

  private fun loadAdaptiveBanner(container: FrameLayout) {
    val ctx = container.context as? ThemedReactContext ?: return
    val pid = placementId ?: return

    // clear any old ad
    container.removeAllViews()

    // screen metrics
    val res = ctx.resources
    val dm = res.displayMetrics
    val screenWidthPx = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      ctx.currentActivity
        ?.windowManager
        ?.currentWindowMetrics
        ?.bounds
        ?.width() ?: dm.widthPixels
    } else {
      dm.widthPixels
    }
    val screenHeightPx = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      ctx.currentActivity
        ?.windowManager
        ?.currentWindowMetrics
        ?.bounds
        ?.height() ?: dm.heightPixels
    } else {
      dm.heightPixels
    }
    val density = dm.density
    val screenWidthDp = (screenWidthPx / density).toInt()
    val screenHeightDp = (screenHeightPx / density).toInt()

    // Choose final widthDp based on mode + inlineWidth + orientation
    val finalWidthDp = when {
      mode == "inline" && inlineWidthDp != null -> inlineWidthDp!!
      orientation == "portrait"  -> screenWidthDp.coerceAtMost(screenHeightDp)
      orientation == "landscape" -> screenWidthDp.coerceAtLeast(screenHeightDp)
      else                        -> screenWidthDp
    }

    // Build the ad size request
    val builder = AdRequestConfiguration.builder(ctx, pid)
    if (mode == "inline") {
      Log.d(TAG, "🟢 INLINE banner: widthDp=$finalWidthDp, maxHeight=250dp")
      builder.addInlineAdaptiveBannerAdSize(finalWidthDp, 250)
    } else {
      Log.d(TAG, "🔵 ANCHORED banner: widthDp=$finalWidthDp")
      builder.addAnchoredAdaptiveBannerAdSize(finalWidthDp)
    }

    val config = builder.build()

    AdSterAdLoader.builder()
      .withAdsListener(object : MediationAdListener() {
        override fun onBannerAdLoaded(ad: MediationBannerAd) {
          Log.d(TAG, "✅ onBannerAdLoaded (mode=$mode, orientation=$orientation)")
          container.removeAllViews()
          ad.view?.let { adView ->
            container.addView(adView)
            // measure and send height back to JS
            val wSpec = View.MeasureSpec.makeMeasureSpec(
              (finalWidthDp * density).toInt(),
              View.MeasureSpec.EXACTLY
            )
            val hSpec = View.MeasureSpec.makeMeasureSpec(
              0, View.MeasureSpec.UNSPECIFIED
            )
            adView.measure(wSpec, hSpec)
            val measuredH = adView.measuredHeight
            Log.d(TAG, "📏 measuredHeight=$measuredH px")
            val payload = Arguments.createMap().apply {
              putInt("adHeight", measuredH)
            }
            ctx
              .getJSModule(RCTEventEmitter::class.java)
              .receiveEvent(container.id, "onAdLoaded", payload)
          }
        }

        override fun onFailure(adError: AdError) {
          Log.e(TAG, "❌ onFailure: $adError")
          val payload = Arguments.createMap().apply {
            putString("error", adError.toString())
          }
          ctx
            .getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(container.id, "onAdFailedToLoad", payload)
        }
      })
      .build()
      .loadAd(config)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any> = mapOf(
    "onAdLoaded" to mapOf("registrationName" to "onAdLoaded"),
    "onAdFailedToLoad" to mapOf("registrationName" to "onAdFailedToLoad")
  )
}
