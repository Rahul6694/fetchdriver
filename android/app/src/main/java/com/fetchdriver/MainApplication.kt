package com.fetchdriver.app

import android.app.Application
import android.content.Context
import com.facebook.flipper.android.AndroidFlipperClient
import com.facebook.flipper.android.utils.FlipperUtils
import com.facebook.flipper.plugins.inspector.DescriptorMapping
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor
import com.facebook.flipper.plugins.react.ReactFlipperPlugin
import com.facebook.flipper.plugins.databases.DatabasesFlipperPlugin
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.modules.network.NetworkingModule
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  private val networkFlipperPlugin = NetworkFlipperPlugin()

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
    
    // Initialize Flipper
    if (BuildConfig.DEBUG && FlipperUtils.shouldEnableFlipper(this)) {
      initializeFlipper(this)
    }
  }

  private fun initializeFlipper(context: Context) {
    val client = AndroidFlipperClient.getInstance(context)
    
    client.addPlugin(InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()))
    client.addPlugin(networkFlipperPlugin)
    client.addPlugin(ReactFlipperPlugin())
    client.addPlugin(DatabasesFlipperPlugin(context))
    client.addPlugin(SharedPreferencesFlipperPlugin(context))
    
    // Set up network interceptor
    NetworkingModule.setCustomClientBuilder { builder ->
      builder.addNetworkInterceptor(FlipperOkhttpInterceptor(networkFlipperPlugin))
    }
    
    client.start()
  }
}
