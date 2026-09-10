import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import ContainerView from '../../../Component/ContainerView';
import HeaderWithBack from '../../../Component/HeaderWithBack';
import {Typography} from '../../../Component/Typography';
import {Images} from '../../../Constants/Images';
import {Fonts} from '../../../Constants/Fonts';
import {Colors} from '../../../Constants/Colors';

import {windowWidth} from '../../../Constants/Dimensions';
import Button from '../../../Component/Button';
import {checkBox, personalData} from '../../../Redux/action';
import {useDispatch, useSelector} from 'react-redux';
import {GET, GetNew} from '../../../Backend/Backend';
import {CMS, FAQ} from '../../../Backend/ApiRoutes';
import {ToastMsg} from '../../../Component/ToastMsg';
import {FULL_HEIGHT} from '../../../Constants/Layout';
import localization from '../../../Constants/localization';
import WebView from 'react-native-webview';

const Terms_Condition = ({navigation, route}) => {
  const personal_Data = useSelector(store => store.personalData);
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState([]);
  const [faq, setfaq] = useState([]);
  const [showanswer, setShowAnswer] = useState(null);

  React.useEffect(() => {
    fetchFaqData();
  }, []);

  const fetchFaqData = () => {
    setLoading(true);
    GetNew(
      `${FAQ}${'after'}`,
      success => {
        setLoading(false);

        setfaq(success?.driver_faq[0]?.body)
        setFaqData(success?.data || []);
      },
      error => {
        setLoading(false);
      },
    );
  };
  const dispatch = useDispatch();
  const toggleAnswer = question => {
    setShowAnswer(showanswer === question ? null : question);
  };

  return (
    <ContainerView>
      <HeaderWithBack source={Images.Back} headerHelp={true} />
      {loading ? (
        <View
          style={{
            height: FULL_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}>
          <ActivityIndicator
            size="large"
            color={Colors.Black}
            style={styles.loader}
          />
        </View>
      ) : (
        <ScrollView style={styles.container}>
        <Typography
           size={18}
           fontFamily={Fonts.Inter_SemiBold}
           color={Colors}>
            {localization?.Legal?.termsAndConditions}
         </Typography>
         {/* <Typography lineHeight={23} style={{marginVertical: 10}}>
           {faq}
         </Typography> */}
        
         {faqData?.map((faq, index) => (
           <View key={index}>
             <TouchableOpacity
               style={[
                 styles.faqItem,
                 {
                   backgroundColor:
                     showanswer === faq.question
                       ? Colors.yellow
                       : Colors.bg_grey,
                 },
               ]}
               onPress={() => toggleAnswer(faq.question)}>
               <Typography
                 color={
                   showanswer === faq.question ? Colors.white : Colors.black
                 }
                 size={18}
                 fontFamily={Fonts.Inter_SemiBold}>
                 {faq?.question}
               </Typography>

               <Image
                 source={
                   showanswer === faq.question
                     ? Images.arrow_up
                     : Images.dropdown
                 }
                 style={{width: 16, height: 10}}
               />
             </TouchableOpacity>
             {showanswer === faq?.question && (
               <View style={{paddingHorizontal: 8}}>
                 <Typography lineHeight={26}>{faq?.answer} 
                 </Typography>
               </View>
             )}
           </View>
         ))}
       </ScrollView>
      )}

      <Button
        title={localization?.multiDropDown?.Agree}
        onPress={() => {
          const combinedData = {
            ...personal_Data, // Include existing personal data
            terms: true,
          };
          dispatch(personalData(combinedData));
          navigation.goBack();
        }}
        style_button={{backgroundColor: Colors?.Black, top: 0, bottom: 0}}
      />
    </ContainerView>
  );
};

export default Terms_Condition;

const styles = StyleSheet.create({
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#E7E9E766',
    marginRight: 16,
  },
  container: {
    backgroundColor: 'red',
  },
  icon: {
    width: 14.5,
    height: 15,
    tintColor: Colors.Black,
  },
  separator: {
    alignItems: 'center',
    borderColor: '#ECECEC',
    borderWidth: 0.5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  image_Container: {
    flexDirection: 'row',
    width: 150,
    justifyContent: 'space-between',
  },
  image: {
    height: 30,
    width: 30,
  },
  container: {
    backgroundColor: Colors.white,
  },
  faqItem: {
    paddingVertical: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
