import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {GET, GetNew} from '../../Backend/Backend';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import {CMS} from '../../Backend/ApiRoutes';
import ContainerView from '../../Component/ContainerView';
import {useIsFocused} from '@react-navigation/native';
import {Typography} from '../../Component/Typography';
import {Fonts} from '../../Constants/Fonts';
import localization from '../../Constants/localization';
import { FULL_HEIGHT } from '../../Constants/Layout';

const Cms = ({navigation, route}) => {
  const slug = route.params.slug;
  const screenName = route.params.name;
  const [cmsData, setCmsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocus = useIsFocused();
  useEffect(() => {
    if (!!isFocus) {
      cmsApi();
    }
  }, [isFocus]);
console.log("4444444 ==>",slug)
  const cmsApi = () => {
    setLoading(true);
    GetNew(
      `${CMS}${slug}`,
      success => {
        setLoading(false);

        setCmsData(success?.data);
        console.log('success on cms',success);
        
      },
      error => {
        console.log('error on cms',error);
        setLoading(false);
      },
    );
  };

  const injectedJavaScript = `
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'viewport');
  meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  document.getElementsByTagName('head')[0].appendChild(meta);
  
  document.addEventListener('touchstart', function(event) {
  if (event.touches.length > 1) {
  event.preventDefault();
  }
  }, { passive: false });
  
  document.addEventListener('gesturestart', function(event) {
  event.preventDefault();
  });
  
  true; // note: this is needed to return a true value, preventing issues in WebView
  `;

  return (
    <View
      style={{paddingHorizontal: 22, backgroundColor: Colors?.white, flex: 1}}>
      <HeaderWithBack
        source={Images.Back}
        title={
          slug == 'about-us'
            ? localization?.cms?.about
            : slug == 'term-conditions-before'
            ? localization?.cms?.terms
            : slug == 'privacy-policy'
            ? localization?.cms?.policy
            : slug == 'data-provider'
            ? localization?.cms?.data
            : slug == 'software-licence'
            ? localization?.cms?.Licence
            : slug == 'location-information'
            ? localization?.cms?.Location
            : slug == 'take-photo-signup'
            ? localization?.cms?.more
            : slug == 'car-inspection-report'
            ? localization?.cms?.Car
            : slug == "licence-description"
            ? localization?.cms?.Des
            : localization?.cms?.terms

        }
      />

      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.Black}
            style={styles.loader}
          />
        ) : !loading && !cmsData?.body ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Typography
              textAlign="center"
              size={20}
              fontFamily={Fonts?.Inter_Medium}>
              {localization?.cms?.no}
            </Typography>
          </View>
        ) : (
          <WebView
          javaScriptEnabled={true}
          style={{ height:FULL_HEIGHT + 200, backgroundColor: Colors?.white,width:"100%" }}
          originWhitelist={['*']}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          injectedJavaScript={injectedJavaScript}
          source={{
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1"/>
                <style>
                  html, body {
                    padding: 0;
                    margin: 0;
                    height:100%
                    box-sizing: border-box;
                    font-family: Arial, sans-serif;
                    color: #686972;
                    overflow: hidden; /* Prevent scrolling and hide scrollbars */
                    -ms-overflow-style: none; /* Hide scrollbars in IE and Edge */
                    scrollbar-width: none; /* Hide scrollbars in Firefox */
                  }
                  ::-webkit-scrollbar {
                    display: none; /* Hide scrollbars in WebKit browsers */
                  }
                  h1 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    color: black;
                  }
                  .content {
                    width: 100%;
                    box-sizing: border-box;
                    font-size:16px !important;
                  }
                  img {
                    width: 100%;
                    height: auto;
                    display: block;
                  }
        
                  span {
                    font-size:16px !important;
                  }
        
        
                </style>
              </head>
              <body>
                <div class="content">${cmsData?.body || ''}</div>
              </body>
              </html>`,
          }}
        />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.LightWhite,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    backgroundColor: Colors.LightWhite,
  },
});

export default Cms;
