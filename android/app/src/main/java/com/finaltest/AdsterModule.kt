// File: android/app/src/main/java/com/finaltest/AdSterModule.kt
package com.finaltest

import android.os.Build
import android.util.DisplayMetrics
import android.util.Log
import android.view.View.MeasureSpec
import com.facebook.react.bridge.*
import com.adster.sdk.mediation.*

private const val TAG = "AdSterModule"

class AdSterModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "AdSterModule"

  /** Calculate the *dp* width of the ad slot at runtime. */
  private fun calculateAdWidthDp(): Int {
    Log.d(TAG, "calculateAdWidthDp() begin")
    val metrics: DisplayMetrics = reactContext.resources.displayMetrics
    var widthPx = metrics.widthPixels

    currentActivity?.let { activity ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        widthPx = activity.windowManager.currentWindowMetrics.bounds.width()
        Log.d(TAG, "  (Android R+) real widthPx=$widthPx")
      }
    }

    val dp = (widthPx / metrics.density).toInt()
    Log.d(TAG, "calculateAdWidthDp() → ${dp}dp")
    return dp
  }

  @ReactMethod
  fun getAdSize(promise: Promise) {
    Log.d(TAG, "getAdSize() called")
    try {
      val dp = calculateAdWidthDp()
      promise.resolve(dp)
      Log.d(TAG, "getAdSize() resolved → $dp dp")
    } catch (e: Exception) {
      Log.w(TAG, "getAdSize() error", e)
      promise.reject("AD_SIZE_ERROR", e.message)
    }
  }

  @ReactMethod
  fun loadAdaptiveBanner(
    placementId: String,
    promise: Promise
  ) {
    Log.d(TAG, "loadAdaptiveBanner(placementId=$placementId) start")
    val widthDp = calculateAdWidthDp()
    val metrics = reactContext.resources.displayMetrics
    val widthPx = (widthDp * metrics.density).toInt()
    Log.d(TAG, "  converting $widthDp dp → $widthPx px for measurement")

    val config = AdRequestConfiguration
      .builder(reactContext, placementId)
      .addAnchoredAdaptiveBannerAdSize(widthDp)
      .build()

    AdSterAdLoader.builder()
      .withAdsListener(object : MediationAdListener() {
        override fun onBannerAdLoaded(ad: MediationBannerAd) {
          Log.d(TAG, "  onBannerAdLoaded")
          ad.view?.let { view ->
            view.measure(
              MeasureSpec.makeMeasureSpec(widthPx, MeasureSpec.EXACTLY),
              MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
            )
            val heightPx = view.measuredHeight
            Log.d(TAG, "    measuredHeight=$heightPx px")
            promise.resolve(heightPx)
            Log.d(TAG, "loadAdaptiveBanner() promise resolved → $heightPx px")
          } ?: run {
            Log.w(TAG, "  onBannerAdLoaded: ad.view is null")
            promise.reject("NO_AD_VIEW", "Banner ad returned no view")
          }
        }

        override fun onFailure(adError: AdError) {
          Log.w(TAG, "  onFailure: ${adError.errorMessage}")
          promise.reject("AD_LOAD_FAILED", adError.errorMessage)
        }
      })
      .build()
      .loadAd(config)
  }
}