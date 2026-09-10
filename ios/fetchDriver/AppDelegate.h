// #import <RCTAppDelegate.h>
// #import <UIKit/UIKit.h>
// #import <UserNotifications/UNUserNotificationCenter.h>

// @interface AppDelegate : RCTAppDelegate
//  <UNUserNotificationCenterDelegate>

// @end


#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h>
@interface AppDelegate : RCTAppDelegate
<UNUserNotificationCenterDelegate>
@property (nonatomic, strong) UIWindow *window;

@end