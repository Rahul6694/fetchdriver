#import "NotificationBadgeStorage.h"
#import <UIKit/UIKit.h>

NSString *const FetchNotificationBadgeCountKey = @"fetch_notification_badge_count";

@implementation NotificationBadgeStorage

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

+ (NSInteger)storedCount
{
  return [[NSUserDefaults standardUserDefaults] integerForKey:FetchNotificationBadgeCountKey];
}

+ (void)setStoredCount:(NSInteger)count
{
  NSInteger safe = count < 0 ? 0 : count;
  [[NSUserDefaults standardUserDefaults] setInteger:safe forKey:FetchNotificationBadgeCountKey];
  [[NSUserDefaults standardUserDefaults] synchronize];

  dispatch_async(dispatch_get_main_queue(), ^{
    [UIApplication sharedApplication].applicationIconBadgeNumber = safe;
  });
}

+ (NSInteger)incrementStoredCount
{
  NSInteger next = [self storedCount] + 1;
  [self setStoredCount:next];
  return next;
}

RCT_EXPORT_METHOD(setCount:(nonnull NSNumber *)count)
{
  [NotificationBadgeStorage setStoredCount:count.integerValue];
}

RCT_EXPORT_METHOD(increment:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSInteger next = [NotificationBadgeStorage incrementStoredCount];
  resolve(@(next));
}

RCT_EXPORT_METHOD(getCount:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@([NotificationBadgeStorage storedCount]));
}

@end
