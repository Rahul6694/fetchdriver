import React, {useState, useEffect} from 'react';
import {StyleSheet, View, ActivityIndicator, ToastAndroid} from 'react-native';
import {WebView} from 'react-native-webview';
import HeaderWithBack from '../../../../Component/HeaderWithBack';
import {GET} from '../../../../Backend/Backend';
import {Images} from '../../../../Constants/Images';
import {Colors} from '../../../../Constants/Colors';
import {CMS} from '../../../../Backend/ApiRoutes';
import ContainerView from '../../../../Component/ContainerView';
import { GetNew } from '../../Backend/Backend';

const Cms = ({route}) => {
  const slug = route.params.slug;
  const screenName = route.params.name;
  const [cmsData, setCmsData] = useState({body: '<p>No content available</p>'});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    cmsApi();
  }, []);

  const cmsApi = () => {
    setLoading(true);
    GetNew(
      `${CMS}${slug}`,
      success => {
        setLoading(false);
        setCmsData(
          success?.data[0].body || {body: '<p>No content available</p>'},
        );
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
      <HeaderWithBack source={Images.Back} title={screenName} />
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

export default Cms;

{
  /* <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={{marginTop:23,marginBottom:18}}>
    
            <Typography style={styles.bottomText} fontFamily={Fonts.Inter_Bold} size={20} lineHeight={29} color={Colors.Black}>Terms and Conditions</Typography>
            <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                lineHeight={26}
                color={Colors?.textColor}
                style={styles.description}>
                met consectetur. Pellentesque vestibulum dignissim amet mauris in metus tristique blandit est. Aenean rhoncus at eget et aliquam. Mauris ac lorem vestibulum duis malesuada quis tempor gravida.
            </Typography>
        </View>
        <View style={{marginBottom:22}}>
    
            <Typography style={styles.bottomText} fontFamily={Fonts.Inter_Bold} size={16} lineHeight={29} color={Colors.Black}>1. General</Typography>
            <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                lineHeight={24}
                color={Colors?.textColor}
                style={styles.description}>
                Eu nullam enim magna enim malesuada. Auctor sagittis sem et dolor. Risus porttitor in tristique montes morbi. Est nec nascetur ultricies egestas eu.
            </Typography>
            <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                lineHeight={24}
                color={Colors?.textColor}
                style={styles.description}>
                met consectetur. Pellentesque vestibulum dignissim amet mauris in metus tristique blandit est. Aenean rhoncus at eget et aliquam. Mauris ac lorem vestibulum duis malesuada quis tempor gravida. Nunc tempor rhoncus vitae orci tristique. Vel eget tellus vel cursus augue in velit. Tortor justo scelerisque ultricies erat eros. Erat mattis pulvinar ut tincidunt neque. Odio massa aliquam nulla ornare turpis tellus a vitae.
            </Typography>
          
        </View>
    
            <View style={styles.separator}></View>
        <View style={{marginTop:22,marginBottom:22}}>
            <Typography style={styles.bottomText} fontFamily={Fonts.Inter_Bold} size={16} lineHeight={29} color={Colors.Black}>2. Target Service & Programme</Typography>
            <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                lineHeight={24}
                color={Colors?.textColor} style={styles.description}>
                Eu nullam enim magna enim malesuada. Auctor sagittis sem et dolor. Risus porttitor in tristique montes morbi. Est nec nascetur ultricies egestas eu.
            </Typography>
            <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                lineHeight={24}
                color={Colors?.textColor}
                style={styles.description}>
                met consectetur. Pellentesque vestibulum dignissim amet mauris in metus tristique blandit est. Aenean rhoncus at eget et aliquam. Mauris ac lorem vestibulum duis malesuada quis tempor gravida. Nunc tempor rhoncus vitae orci tristique. Vel eget tellus vel cursus augue in velit. Tortor justo scelerisque ultricies erat eros. Erat mattis pulvinar ut tincidunt neque. Odio massa aliquam nulla ornare turpis tellus a vitae.
            </Typography>
           
        </View>
        <View style={styles.separator}></View>
        <View style={{marginTop:22,marginBottom:33}}>
            <Typography style={styles.bottomText} fontFamily={Fonts.Inter_Bold} size={16} lineHeight={29} color={Colors.Black}>3. Related Terms</Typography>
            <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                lineHeight={24}
                color={Colors?.textColor} style={styles.description}>
               Lorem ipsum dolor sit amet consectetur. Pellentesque vestibulum dignissim amet mauris in metus tristique blandit est. Aenean rhoncus at eget et aliquam. Mauris ac lorem vestibulum duis malesuada quis tempor gravida. Nunc tempor rhoncus vitae orci tristique. Vel eget tellus vel cursus augue in velit. Tortor justo scelerisque ultricies erat eros. Erat mattis pulvinar ut tincidunt neque. 
            </Typography>
            <Typography
                fontFamily={Fonts?.Inter_Regular}
                size={14}
                lineHeight={24}
                color={Colors?.textColor}
                style={styles.description}>
              Eu nullam enim magna enim malesuada. Auctor sagittis sem et dolor. Risus porttitor in tristique montes morbi. Est nec nascetur ultricies egestas eu.
            </Typography>
           
        </View>
    </ScrollView> */
}
