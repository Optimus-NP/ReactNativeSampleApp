// File: android/app/src/main/java/com/finaltest/AdsterPackage.kt
package com.finaltest

import android.util.Log
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

private const val TAG = "AdsterPackage"

class AdsterPackage : ReactPackage {

  override fun createNativeModules(
    ctx: ReactApplicationContext
  ): List<NativeModule> {
    Log.d(TAG, "createNativeModules() called")
    return listOf(AdSterModule(ctx))
  }

  override fun createViewManagers(
    ctx: ReactApplicationContext
  ): List<ViewManager<*, *>> {
    Log.d(TAG, "createViewManagers() called")
    return listOf(BannerAdViewManager())
  }
}