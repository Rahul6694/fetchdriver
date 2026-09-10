import React, { useEffect, useState } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';

import Typography from '../../Component/UI/Typography';
import { Images } from '../../Constants/Images';
import HeaderWithBack from '../../Component/HeaderWithBack';
import localization from '../../Constants/localization';
import { Fonts } from '../../Constants/Fonts';
import { Colors } from '../../Constants/Colors';
import { GET_WITH_TOKEN } from '../../Backend/Backend';
import { PAYMENT_HISTORY } from '../../Backend/ApiRoutes';

const PaymentHistoryScreen = ({ navigation }) => {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);


    useEffect(() => {
        GET_WITH_TOKEN(
            `${PAYMENT_HISTORY}`,
            success => {
                console.log(success.data, "0000000000");
                setAllData(success?.data || []); // ✅ safe check
                setLoading(false);
                console.log('success on payment ',success);
                
            },
            error => {
                setLoading(false);
                console.log(' error on payment ',error);
            },
            fail => {
                setLoading(false);
                console.log('fail on payment ',fail);
            }
        );
    }, []);

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirm = (date) => {
        const formatted = moment(date).format('YYYY-MM-DD');
        setSelectedDate(formatted);
        setDatePickerVisibility(false);
    };

    const filteredData = selectedDate
        ? allData.filter(item => item?.ride_date === selectedDate)
        : allData;

    const totalAmount = filteredData.reduce((sum, item) => {
        const amount = parseFloat(item?.amount) || 0;
        const tip = parseFloat(item?.tip_amount) || 0;
        return sum + amount + tip;
    }, 0);

    const renderItem = ({ item }) => {
        const amount = parseFloat(item?.amount) || 0;
        const tip = parseFloat(item?.tip_amount) || 0;

        return (
            <View style={styles.row}>
                <View style={styles.iconWrapper}>
                    <Image
                        source={Images.PaymentIncome}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.details}>
                    <Typography size={16} fontFamily={Fonts.Inter_SemiBold} color={Colors.Black}>
                        {item?.ride_time ? moment(item.ride_time, "HH:mm").format("hh:mm A") : '--:--'}
                    </Typography>

                    <Typography size={14} fontFamily={Fonts.Inter_Regular} color={'#7B7A77'}>
                        {item?.status_id || '--'}
                    </Typography>
                </View>

                <View style={styles.amountBlock}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Typography size={16} fontFamily={Fonts.Inter_SemiBold} color={Colors.selectedBorderColor}>
                            +
                        </Typography>
                        <Typography
                            size={16}
                            fontFamily={Fonts.Inter_SemiBold}
                            color={Colors.black}
                            style={{ marginLeft: 4 }}>
                            {`ZAR ${(amount + tip).toFixed(2)} `}
                        </Typography>
                    </View>

                    {tip > 0 && (
                        <Typography
                            textAlign={"right"}
                            size={12}
                            fontFamily={Fonts.Inter_Regular}
                            color={'#9D9D9D'}>
                            {`ZAR ${amount.toFixed(2)} + ZAR ${tip.toFixed(2)} Tip`}
                        </Typography>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HeaderWithBack
                style={{ paddingHorizontal: 19 }}
                title={localization.DrawerScreen.paymentHistory}
                source={Images.Back}
                showSpace
                rightImage={Images.edit}
                rightOnPress={() => { navigation.navigate("PaymentDetail") }}
            />

            {loading ? (
                <View style={{ justifyContent: "center", alignItems: "center", flex: 1 }}>
                    <ActivityIndicator size={"large"} />
                </View>
            ) : (
                <>
                    <View style={styles.balanceContainer}>
                        <Typography style={styles.balanceLabel}>ZAR </Typography>
                        <Typography style={styles.balanceAmount}>{totalAmount.toFixed(2)}</Typography>
                    </View>

                    <View style={styles.listContainer}>
                        <View style={styles.listHeader}>
                            <Typography size={22} fontFamily={Fonts.Inter_Bold} color={Colors.Black}>
                                {selectedDate ? moment(selectedDate).format('MMM DD, YYYY') : 'Today'}
                            </Typography>

                            <TouchableOpacity onPress={showDatePicker}>
                                <Image source={Images.Calendar} style={styles.calendarIcon} />
                            </TouchableOpacity>
                        </View>

                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />

                        <FlatList
                            style={{ backgroundColor: "#fff", flex: 1 }}
                            data={filteredData}
                            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={
                                filteredData.length === 0
                                    ? { flex: 1, justifyContent: "center", alignItems: "center" }
                                    : null
                            }
                            ListEmptyComponent={
                                <Typography>{localization.ManageProfile.noDataAvailable}</Typography>
                            }
                        />
                    </View>
                </>
            )}
        </View>
    );


};

export default PaymentHistoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    balanceContainer: {
        backgroundColor: '#000',
        alignItems: 'center',
        paddingVertical: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        height: 187,
    },
    balanceLabel: {
        fontSize: 32,
        color: 'limegreen',
        marginRight: 6,
        fontWeight: 'bold',
    },
    balanceAmount: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
    },
    listContainer: {
        backgroundColor: '#fff',
        paddingTop: 16,
        paddingHorizontal: 16,
        flex: 1,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    calendarIcon: {
        width: 20,
        height: 20,
        tintColor: '#000',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    iconWrapper: {
        backgroundColor: '#00DB4614',
        borderRadius: 30,
        padding: 19,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#00DB4614',
    },
    icon: {
        width: 18,
        height: 18,
        tintColor: '#00DB46',
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    amountBlock: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        maxWidth: 120,
    },
});
