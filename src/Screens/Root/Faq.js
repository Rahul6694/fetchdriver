import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { GET, GetNew } from '../../Backend/Backend';
import HeaderWithBack from '../../Component/HeaderWithBack';
import { Images } from '../../Constants/Images';
import { Colors } from '../../Constants/Colors';
import { FAQ } from '../../Backend/ApiRoutes';
import ContainerView from '../../Component/ContainerView';
import Typography from '../../Component/UI/Typography';
import { Fonts } from '../../Constants/Fonts';
import { FULL_HEIGHT } from '../../Constants/Layout';
import localization from '../../Constants/localization';
import { ToastMsg } from '../../Component/ToastMsg';

const Faq = ({ route }) => {
  const screenName = route.params.name;
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showanswer, setShowAnswer] = useState(null);
  const [faq, setfaq] = useState([]);


  useEffect(() => {
    fetchFaqData();
  }, []);

  const fetchFaqData = () => {
    setLoading(true);
    GetNew(
      `${FAQ}${'after'}`,
      success => {
        setLoading(false);
        console.log("55555 ==>33", success)
        setfaq(success?.driver_faq[0]?.body)
        setFaqData(success?.data || []);
      },
      error => {
        setLoading(false);
        ToastMsg("Failed to fetch FAQs. Please try again.")
      },
    );
  };

  const toggleAnswer = question => {
    setShowAnswer(showanswer === question ? null : question);
  };

  return (
    <ContainerView>
      <HeaderWithBack source={Images.Back} title={localization?.multiDropDown?.help} />
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
            {localization?.DrawerScreen?.faq}
          </Typography>
          {/* <Typography lineHeight={23} style={{ marginVertical: 10 }}>
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
                  style={{ width: 16, height: 10 }}
                />
              </TouchableOpacity>
              {showanswer === faq?.question && (
                <View style={{ paddingHorizontal: 8 }}>
                  <Typography lineHeight={26}>{faq?.answer}
                  </Typography>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </ContainerView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default Faq;
