#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <React/RCTAppSetupUtils.h>
#import <TrustKit/TrustKit.h>

#if RCT_NEW_ARCH_ENABLED
#import <React/CoreModulesPlugins.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTFabricSurfaceHostingProxyRootView.h>
#import <React/RCTSurfacePresenter.h>
#import <React/RCTSurfacePresenterBridgeAdapter.h>
#import <ReactCommon/RCTTurboModuleManager.h>

#import <react/config/ReactNativeConfig.h>

static NSString *const kRNConcurrentRoot = @"concurrentRoot";

@interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
  RCTTurboModuleManager *_turboModuleManager;
  RCTSurfacePresenterBridgeAdapter *_bridgeAdapter;
  std::shared_ptr<const facebook::react::ReactNativeConfig> _reactNativeConfig;
  facebook::react::ContextContainer::Shared _contextContainer;
}
@end
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Configure TrustKit for certificate pinning with enhanced security
  NSDictionary *trustKitConfig = @{
    // CRITICAL: Enable network delegate swizzling to intercept React Native network calls
    kTSKSwizzleNetworkDelegates: @YES,
    
    kTSKPinnedDomains: @{
      @"lock-screen-backend.overflowhosting.tech": @{
        // Enforce certificate pinning (block connections on failure)
        kTSKEnforcePinning: @YES,
        
        // Don't include subdomains
        kTSKIncludeSubdomains: @NO,
        
        // Public key hashes for certificate pinning
        kTSKPublicKeyHashes: @[
          @"x8dhkklTSAOrXliSIfkfdWc+BYLO/hkQNYrd/H9egQg=", // Current leaf certificate public key
          @"AlSQhgtJirc8ahLyekmtX+Iw+v46yPYRLJt9Cq1GlB0=", // Current intermediate certificate public key (backup)
        ],
        
        // Disable certificate transparency validation for Let's Encrypt
        kTSKDisableDefaultReportUri: @YES,
        
        // Custom report URI (optional)
        kTSKReportUris: @[@"https://lock-screen-backend.overflowhosting.tech/trustkit-report"]
      }
    }
  };
  
  NSLog(@"🔒 Initializing TrustKit with network delegate swizzling ENABLED");
  NSLog(@"🔒 Target domain: lock-screen-backend.overflowhosting.tech");
  NSLog(@"🔒 Certificate hashes: %@", trustKitConfig[kTSKPinnedDomains][@"lock-screen-backend.overflowhosting.tech"][kTSKPublicKeyHashes]);
  
  [TrustKit initSharedInstanceWithConfiguration:trustKitConfig];
  
  // Verify TrustKit initialization
  if ([TrustKit sharedInstance]) {
    NSLog(@"✅ TrustKit successfully initialized and ready to intercept network calls");
    NSLog(@"🔒 Certificate pinning is now ACTIVE for lock-screen-backend.overflowhosting.tech");
    NSLog(@"🚨 MITM attacks should now be BLOCKED");
  } else {
    NSLog(@"❌ TrustKit initialization FAILED - Certificate pinning NOT active");
  }
  

  RCTAppSetupPrepareApp(application);

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];

#if RCT_NEW_ARCH_ENABLED
  _contextContainer = std::make_shared<facebook::react::ContextContainer const>();
  _reactNativeConfig = std::make_shared<facebook::react::EmptyReactNativeConfig const>();
  _contextContainer->insert("ReactNativeConfig", _reactNativeConfig);
  _bridgeAdapter = [[RCTSurfacePresenterBridgeAdapter alloc] initWithBridge:bridge contextContainer:_contextContainer];
  bridge.surfacePresenter = _bridgeAdapter.surfacePresenter;
#endif

  NSDictionary *initProps = [self prepareInitialProps];
  UIView *rootView = RCTAppSetupDefaultRootView(bridge, @"LockScreenRN", initProps);

  if (@available(iOS 13.0, *)) {
    rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
    rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feture is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
  // Switch this bool to turn on and off the concurrent root
  return true;
}

- (NSDictionary *)prepareInitialProps
{
  NSMutableDictionary *initProps = [NSMutableDictionary new];

#ifdef RCT_NEW_ARCH_ENABLED
  initProps[kRNConcurrentRoot] = @([self concurrentRootEnabled]);
#endif

  return initProps;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#if RCT_NEW_ARCH_ENABLED

#pragma mark - RCTCxxBridgeDelegate

- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  _turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                             delegate:self
                                                            jsInvoker:bridge.jsCallInvoker];
  return RCTAppSetupDefaultJsExecutorFactory(bridge, _turboModuleManager);
}

#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  return RCTCoreModulesClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return nullptr;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                     initParams:
                                                         (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return nullptr;
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return RCTAppSetupDefaultModuleFromClass(moduleClass);
}

#endif

@end
