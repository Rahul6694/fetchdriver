




#import "AppDelegate.h"
#import "NotificationBadgeStorage.h"
#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
#import <GoogleMaps/GoogleMaps.h> // Add this to the top
@implementation AppDelegate

// Handle remote notifications registration
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Handle remote notifications
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  // APNS sends absolute badge:1 — increment our persisted count instead.
  if (application.applicationState != UIApplicationStateActive) {
    [NotificationBadgeStorage incrementStoredCount];
  }

  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

// Handle registration failure
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

// Handle notification responses
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}

// Handle notifications when app is in foreground
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert);
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure]; // Initialize Firebase
 [GMSServices provideAPIKey:@"AIzaSyA2dTyxqYpbQ_vLV50NRDBR36RjmwSn9wI"];
  self.moduleName = @"fetchDriver"; // Update with your module name
 

  // Initialize UserNotifications
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  self.initialProps = @{};
   sleep(3);
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

