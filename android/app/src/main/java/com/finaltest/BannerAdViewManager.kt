// File: android/app/src/main/java/com/finaltest/BannerAdViewManager.kt

package com.finaltest

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

    override fun getName(): String = "RNBannerAdView"

    override fun createViewInstance(ctx: ThemedReactContext): FrameLayout = FrameLayout(ctx).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        Log.d(TAG, "createViewInstance")
    }

    private var placementId: String? = null
    private var mode: String = "anchored"
    private var inlineWidthDp: Int? = null

    @ReactProp(name = "placementId")
    fun setPlacementId(view: FrameLayout, pid: String) {
        placementId = pid
        Log.d(TAG, " placementId=$pid → loading")
        loadAdaptiveBanner(view)
    }

    @ReactProp(name = "mode")
    fun setMode(view: FrameLayout, modeStr: String) {
        mode = modeStr.lowercase()
        Log.d(TAG, "mode=$mode → reloading")
        loadAdaptiveBanner(view)
    }

    @ReactProp(name = "inlineWidthDp")
    fun setInlineWidthDp(view: FrameLayout, wDp: Int) {
        inlineWidthDp = wDp
        Log.d(TAG, " inlineWidthDp=${wDp}dp → reloading")
        loadAdaptiveBanner(view)
    }

    private fun loadAdaptiveBanner(container: FrameLayout) {
        val ctx = container.context as? ThemedReactContext ?: return
        val pid = placementId ?: run {
            Log.e(TAG, " placementId is null")
            return
        }
        container.removeAllViews()

        // Screen metrics
        val metrics = ctx.resources.displayMetrics
        val screenWidthPx = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            ctx.currentActivity
               ?.windowManager
               ?.currentWindowMetrics
               ?.bounds
               ?.width() ?: metrics.widthPixels
        } else {
            metrics.widthPixels
        }
        val screenWidthDp = (screenWidthPx / metrics.density).toInt()

        Log.d(TAG, " screenWidthDp=$screenWidthDp (mode=$mode)")

        val builder = AdRequestConfiguration.builder(ctx, pid)
        when (mode) {
            "inline" -> {
                val wDp = inlineWidthDp ?: (screenWidthDp * 0.6f).toInt()
                Log.d(TAG, " inline size → ${wDp}dp, maxHeight=250dp")
                builder.addInlineAdaptiveBannerAdSize(wDp, 250)
            }
            "orientation" -> {
                val wDp = inlineWidthDp ?: screenWidthDp
                Log.d(TAG, " orientation size → current‐orientation ${wDp}dp")
                builder.addCurrentOrientationInlineAdaptiveBannerAdSize(wDp)
            }
            else -> {
                Log.d(TAG, " anchored size → screenWidthDp=$screenWidthDp dp")
                builder.addAnchoredAdaptiveBannerAdSize(screenWidthDp)
            }
        }

        val config = builder.build()
        AdSterAdLoader.builder()
            .withAdsListener(object : MediationAdListener() {
                override fun onBannerAdLoaded(ad: MediationBannerAd) {
                    Log.d(TAG, " onBannerAdLoaded (mode=$mode)")
                    container.removeAllViews()
                    ad.view?.let { adView ->
                        container.addView(adView)

                        val chosenDp = when (mode) {
                            "inline"      -> inlineWidthDp ?: (screenWidthDp * 0.6f).toInt()
                            "orientation" -> inlineWidthDp ?: screenWidthDp
                            else          -> screenWidthDp
                        }
                        val chosenPx = (chosenDp * metrics.density).toInt()
                        val wSpec = View.MeasureSpec.makeMeasureSpec(chosenPx, View.MeasureSpec.EXACTLY)
                        val hSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
                        adView.measure(wSpec, hSpec)
                        val hPx = adView.measuredHeight
                        Log.d(TAG, " measured: width=${chosenPx}px, height=${hPx}px")

                        val payload = Arguments.createMap().apply { putInt("adHeight", hPx) }
                        ctx.getJSModule(RCTEventEmitter::class.java)
                            .receiveEvent(container.id, "onAdLoaded", payload)
                    }
                }

                override fun onFailure(adError: AdError) {
                    Log.e(TAG, "onFailure: $adError")
                    val payload = Arguments.createMap().apply { putString("error", adError.toString()) }
                    ctx.getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(container.id, "onAdFailedToLoad", payload)
                }
            })
            .build()
            .loadAd(config)
    }

    override fun getExportedCustomDirectEventTypeConstants() = mapOf(
        "onAdLoaded" to mapOf("registrationName" to "onAdLoaded"),
        "onAdFailedToLoad" to mapOf("registrationName" to "onAdFailedToLoad")
    )
}
