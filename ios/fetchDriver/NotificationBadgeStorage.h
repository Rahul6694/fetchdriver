#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

NS_ASSUME_NONNULL_BEGIN

extern NSString *const FetchNotificationBadgeCountKey;

@interface NotificationBadgeStorage : NSObject <RCTBridgeModule>

+ (NSInteger)storedCount;
+ (void)setStoredCount:(NSInteger)count;
+ (NSInteger)incrementStoredCount;

@end

NS_ASSUME_NONNULL_END
