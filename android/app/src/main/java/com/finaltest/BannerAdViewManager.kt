package com.finaltest

import android.os.Build
import android.util.Log
import android.view.ViewGroup
import android.view.View
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
        return FrameLayout(ctx).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }
    }

    // Store props but only load when placementId arrives
    private var placementId: String? = null
    private var mode: String = "anchored"
    private var inlineWidthDp: Int? = null

    /** JS prop: placementId=… triggers the load */
    @ReactProp(name = "placementId")
    fun setPlacementId(view: FrameLayout, pid: String) {
        placementId = pid
        Log.d(TAG, "🎯 placementId set: $pid — loading banner")
        loadAdaptiveBanner(view)
    }

    /** JS prop: mode=“inline”/“anchored” just updates state */
    @ReactProp(name = "mode")
    fun setMode(view: FrameLayout, modeStr: String) {
        mode = modeStr.lowercase()
        Log.d(TAG, "🎯 mode set: $mode")
        // no loadAdaptiveBanner here
    }

    /** JS prop: inlineWidthDp=… updates state only */
    @ReactProp(name = "inlineWidthDp")
    fun setInlineWidthDp(view: FrameLayout, widthDp: Int) {
        inlineWidthDp = widthDp
        Log.d(TAG, "🎯 inlineWidthDp set: ${widthDp}dp")
        // no loadAdaptiveBanner here
    }

    private fun loadAdaptiveBanner(container: FrameLayout) {
        val ctx = container.context as? ThemedReactContext ?: return
        val pid = placementId ?: run {
            Log.e(TAG, "❌ placementId is null — cannot load")
            return
        }

        // Clear any previous ad immediately
        container.removeAllViews()

        // Gather screen dims
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

        // Build request
        val builder = AdRequestConfiguration.builder(ctx, pid)
        if (mode == "inline") {
            val wDp = inlineWidthDp ?: (screenWidthDp * 0.6f).toInt()
            Log.d(TAG, "🟢 INLINE banner: widthDp=$wDp, maxHeight=250dp")
            builder.addInlineAdaptiveBannerAdSize(wDp, 250)
        } else {
            Log.d(TAG, "🔵 ANCHORED banner: widthDp=$screenWidthDp")
            builder.addAnchoredAdaptiveBannerAdSize(screenWidthDp)
        }

        val config = builder.build()

        AdSterAdLoader.builder()
            .withAdsListener(object : MediationAdListener() {
                override fun onBannerAdLoaded(ad: MediationBannerAd) {
                    Log.d(TAG, "✅ onBannerAdLoaded (mode=$mode), adding view")
                    container.removeAllViews()  // ensure no overlap
                    ad.view?.let { adView ->
                        container.addView(adView)
                        // Measure with the pixel width matching dp chosen
                        val chosenDp = if (mode == "inline") inlineWidthDp ?: screenWidthDp else screenWidthDp
                        val chosenPx = (chosenDp * metrics.density).toInt()
                        val wSpec = View.MeasureSpec.makeMeasureSpec(chosenPx, View.MeasureSpec.EXACTLY)
                        val hSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
                        adView.measure(wSpec, hSpec)
                        val measuredH = adView.measuredHeight
                        Log.d(TAG, "📏 measuredHeight=$measuredH px")

                        // send height back
                        val payload = Arguments.createMap().apply {
                            putInt("adHeight", measuredH)
                        }
                        ctx.getJSModule(RCTEventEmitter::class.java)
                            .receiveEvent(container.id, "onAdLoaded", payload)
                    }
                }

                override fun onFailure(adError: AdError) {
                    Log.e(TAG, "❌ onFailure: $adError")
                    val payload = Arguments.createMap().apply {
                        putString("error", adError.toString())
                    }
                    ctx.getJSModule(RCTEventEmitter::class.java)
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
