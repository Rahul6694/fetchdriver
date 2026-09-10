import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ActivityIndicator, ToastAndroid} from 'react-native';
import {WebView} from 'react-native-webview';
import HeaderWithBack from '../../Component/HeaderWithBack';
import {GET, GetNew} from '../../Backend/Backend';
import {Images} from '../../Constants/Images';
import {Colors} from '../../Constants/Colors';
import {ABOUT, About, CMS} from '../../Backend/ApiRoutes';
import ContainerView from '../../Component/ContainerView';
import localization from '../../Constants/localization';

const aboutUs = ({route}) => {
  const slug = route.params.slug;
  const screenName = route.params.name;
  const [cmsData, setCmsData] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    aboutUs();
  }, []);

  const aboutUs = () => {
    setLoading(true);
    GetNew(
      `${CMS}${ABOUT}`,
      success => {
        setLoading(false);
        setCmsData(success?.data?.body);
      },
      error => {
        setLoading(false);
        ToastAndroid.show(
          'Failed to fetch data. Please try again.',
          ToastAndroid.SHORT,
        );
        // setCmsData(error?.data[0].body );
      },
    );
  };

  const injectedJavaScript = `
    document.addEventListener('touchstart', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('gesturestart', function(event) {
      event.preventDefault();
    });

    true;
  `;

  return (
    <ContainerView>
      <HeaderWithBack
        source={Images.Back}
        title={localization.DrawerScreen.about}
      />
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.Black}
          style={styles.loader}
        />
      ) : (
        <WebView
          javaScriptEnabled={true}
          style={{flex: 1, backgroundColor: Colors?.white}}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
          injectedJavaScript={injectedJavaScript}
          source={{
            html: `
       <html>
       <head>
       <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1"/>
       </head>
       <style>
       body {
       padding: 0 ;
       margin: 0;
       box-sizing: border-box;
       color:#686972;
       
                   }
                   h1 {
                     font-size: 20px;
                     margin-top: 0;
                     margin-bottom: 10px;
                     color: black;
                   }
                   .content {
                     width: 100%;
                     box-sizing: border-box;
                   }
                   img {
                     width: 100%;
                     height: auto;
                     display: block;
                   }
                 </style>
       
               <body>
               <div class="content">${cmsData || ''}</div>
               </body>
       
               </html>`,
          }}
        />
      )}
    </ContainerView>
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

export default aboutUs;
