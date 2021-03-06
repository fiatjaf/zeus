import * as React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Badge, Button, Header } from 'react-native-elements';
import { inject, observer } from 'mobx-react';
import LinearGradient from 'react-native-linear-gradient';
import PrivacyUtils from './../../utils/PrivacyUtils';
import { localeString } from './../../utils/LocaleUtils';

import NodeInfoStore from './../../stores/NodeInfoStore';
import UnitsStore from './../../stores/UnitsStore';
import BalanceStore from './../../stores/BalanceStore';
import SettingsStore from './../../stores/SettingsStore';

const TorIcon = require('./../../images/tor.png');

import { version, playStore } from './../../package.json';

interface MainPaneProps {
    navigation: any;
    NodeInfoStore: NodeInfoStore;
    UnitsStore: UnitsStore;
    BalanceStore: BalanceStore;
    SettingsStore: SettingsStore;
}

interface MainPaneState {
    combinedBalance: boolean;
}

@inject('UnitsStore', 'SettingsStore')
@observer
export default class MainPane extends React.Component<
    MainPaneProps,
    MainPaneState
> {
    state = {
        combinedBalance: false
    };

    render() {
        const {
            NodeInfoStore,
            UnitsStore,
            BalanceStore,
            SettingsStore,
            navigation
        } = this.props;
        const { combinedBalance } = this.state;
        const { changeUnits, getAmount, units } = UnitsStore;
        const {
            totalBlockchainBalance,
            unconfirmedBlockchainBalance,
            lightningBalance,
            pendingOpenBalance
        } = BalanceStore;
        const { settings, implementation } = SettingsStore;
        const nodeAddress = SettingsStore.host || SettingsStore.url;
        const { theme, lurkerMode } = settings;
        const loading = NodeInfoStore.loading || BalanceStore.loading;

        const pendingUnconfirmedBalance =
            Number(pendingOpenBalance) + Number(unconfirmedBlockchainBalance);
        const combinedBalanceValue =
            Number(totalBlockchainBalance) + Number(lightningBalance);

        const LightningBalance = () => (
            <>
                <Text style={styles.lightningBalance}>
                    {units &&
                        (lurkerMode
                            ? PrivacyUtils.hideValue(
                                  getAmount(lightningBalance),
                                  8,
                                  true
                              )
                            : getAmount(lightningBalance))}{' '}
                    ⚡
                </Text>
                {pendingOpenBalance > 0 ? (
                    <Text style={styles.pendingBalance}>
                        {units &&
                            (lurkerMode
                                ? PrivacyUtils.hideValue(
                                      getAmount(pendingOpenBalance),
                                      8,
                                      true
                                  )
                                : getAmount(pendingOpenBalance))}{' '}
                        pending open
                    </Text>
                ) : null}
            </>
        );

        const BalanceView = () => (
            <React.Fragment>
                <LightningBalance />
                <Text style={styles.blockchainBalance}>
                    {units &&
                        (lurkerMode
                            ? PrivacyUtils.hideValue(
                                  getAmount(totalBlockchainBalance),
                                  8,
                                  true
                              )
                            : getAmount(totalBlockchainBalance))}{' '}
                    ⛓️
                </Text>
                {unconfirmedBlockchainBalance ? (
                    <Text style={styles.pendingBalance}>
                        {units &&
                            (lurkerMode
                                ? PrivacyUtils.hideValue(
                                      getAmount(unconfirmedBlockchainBalance),
                                      8,
                                      true
                                  )
                                : getAmount(unconfirmedBlockchainBalance))}{' '}
                        pending
                    </Text>
                ) : null}
            </React.Fragment>
        );

        const BalanceViewCombined = () => (
            <React.Fragment>
                <Text style={styles.lightningBalance}>
                    {units &&
                        (lurkerMode
                            ? PrivacyUtils.hideValue(
                                  getAmount(combinedBalanceValue),
                                  null,
                                  true
                              )
                            : getAmount(combinedBalanceValue))}
                </Text>
                {unconfirmedBlockchainBalance || pendingOpenBalance ? (
                    <Text style={styles.pendingBalance}>
                        {units &&
                            (lurkerMode
                                ? PrivacyUtils.hideValue(
                                      getAmount(pendingUnconfirmedBalance),
                                      null,
                                      true
                                  )
                                : getAmount(pendingUnconfirmedBalance))}{' '}
                        pending
                    </Text>
                ) : null}
            </React.Fragment>
        );

        const SettingsButton = () => (
            <Button
                title=""
                icon={{
                    name: 'settings',
                    size: 25,
                    color: '#fff'
                }}
                buttonStyle={{
                    backgroundColor: 'transparent',
                    marginRight: -10
                }}
                onPress={() => navigation.navigate('Settings')}
            />
        );

        let infoValue = 'ⓘ';
        if (NodeInfoStore.nodeInfo.isTestNet) {
            infoValue = localeString('views.Wallet.MainPane.testnet');
        } else if (NodeInfoStore.nodeInfo.isRegTest) {
            infoValue = localeString('views.Wallet.MainPane.regnet');
        }

        const DefaultBalance = () => (
            <>
                <TouchableOpacity
                    onPress={() => changeUnits()}
                    onLongPress={() =>
                        this.setState({
                            combinedBalance: !combinedBalance
                        })
                    }
                >
                    {combinedBalance ? (
                        <BalanceViewCombined />
                    ) : (
                        <BalanceView />
                    )}
                </TouchableOpacity>
            </>
        );

        const LndHubBalance = () => (
            <>
                <TouchableOpacity onPress={() => changeUnits()}>
                    <LightningBalance />
                </TouchableOpacity>
            </>
        );

        const NodeInfoBadge = () => (
            <View style={styles.nodeInfo}>
                {nodeAddress && nodeAddress.includes('.onion') ? (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('NodeInfo')}
                    >
                        <Image
                            style={{ width: 25, height: 25 }}
                            source={TorIcon}
                        />
                    </TouchableOpacity>
                ) : null}
                {nodeAddress && !nodeAddress.includes('.onion') ? (
                    <Badge
                        onPress={() => navigation.navigate('NodeInfo')}
                        value={infoValue}
                        badgeStyle={{
                            backgroundColor: 'gray',
                            borderWidth: 0,
                            marginLeft: 5
                        }}
                    />
                ) : null}
            </View>
        );

        let mainPane;

        if (loading) {
            mainPane = (
                <View
                    style={
                        theme === 'dark'
                            ? styles.loadingContainerDark
                            : styles.loadingContainer
                    }
                >
                    <Header
                        rightComponent={<SettingsButton />}
                        backgroundColor="transparent"
                        containerStyle={{
                            borderBottomWidth: 0
                        }}
                    />
                    <Button
                        title=""
                        loading
                        buttonStyle={{
                            backgroundColor: 'transparent'
                        }}
                        onPress={() => void 0}
                    />
                </View>
            );
        } else if (!NodeInfoStore.error) {
            mainPane = (
                <View>
                    <LinearGradient
                        colors={
                            theme === 'dark'
                                ? darkThemeGradient
                                : lightThemeGradient
                        }
                        style={styles.container}
                    >
                        <Header
                            leftComponent={<NodeInfoBadge />}
                            rightComponent={<SettingsButton />}
                            backgroundColor="transparent"
                            containerStyle={{
                                borderBottomWidth: 0
                            }}
                        />
                        {implementation === 'lndhub' ? (
                            <LndHubBalance />
                        ) : (
                            <DefaultBalance />
                        )}
                        <View style={styles.buttons}>
                            <Button
                                title={localeString('general.send')}
                                icon={{
                                    name: 'arrow-upward',
                                    size: 25,
                                    color: 'red'
                                }}
                                buttonStyle={{
                                    backgroundColor:
                                        theme === 'dark' ? 'black' : 'white',
                                    borderRadius: 30
                                }}
                                containerStyle={{
                                    marginRight: 10
                                }}
                                titleStyle={{
                                    color: theme === 'dark' ? 'white' : 'black'
                                }}
                                onPress={() => navigation.navigate('Send')}
                                raised={theme !== 'dark'}
                            />
                            <Button
                                title={localeString('general.receive')}
                                icon={{
                                    name: 'arrow-downward',
                                    size: 25,
                                    color: 'green'
                                }}
                                buttonStyle={{
                                    backgroundColor:
                                        theme === 'dark' ? 'black' : 'white',
                                    borderRadius: 30
                                }}
                                containerStyle={{
                                    marginLeft: 10,
                                    marginRight: 10
                                }}
                                titleStyle={{
                                    color: theme === 'dark' ? 'white' : 'black'
                                }}
                                onPress={() => navigation.navigate('Receive')}
                                raised={theme !== 'dark'}
                            />
                            <Button
                                title={localeString('general.scan')}
                                icon={{
                                    name: 'crop-free',
                                    size: 25,
                                    color: '#f1a58c'
                                }}
                                buttonStyle={{
                                    backgroundColor:
                                        theme === 'dark' ? 'black' : 'white',
                                    borderRadius: 20
                                }}
                                containerStyle={{
                                    marginLeft: 10
                                }}
                                titleStyle={{
                                    color: theme === 'dark' ? 'white' : 'black'
                                }}
                                onPress={() =>
                                    navigation.navigate('AddressQRCodeScanner')
                                }
                                raised={theme !== 'dark'}
                            />
                        </View>
                    </LinearGradient>
                </View>
            );
        } else {
            mainPane = (
                <View
                    style={
                        theme === 'dark'
                            ? styles.errorContainerDark
                            : styles.errorContainer
                    }
                >
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 20,
                            marginTop: 20,
                            marginBottom: 25
                        }}
                    >
                        {NodeInfoStore.errorMsg
                            ? NodeInfoStore.errorMsg
                            : localeString('views.Wallet.MainPane.error')}
                    </Text>
                    <Button
                        icon={{
                            name: 'settings',
                            size: 25,
                            color: '#fff'
                        }}
                        title={localeString(
                            'views.Wallet.MainPane.goToSettings'
                        )}
                        buttonStyle={{
                            backgroundColor: 'gray',
                            borderRadius: 30
                        }}
                        containerStyle={{
                            alignItems: 'center'
                        }}
                        onPress={() => navigation.navigate('Settings')}
                    />
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 12,
                            marginTop: 20,
                            marginBottom: -40
                        }}
                    >
                        {playStore ? `v${version}-play` : `v${version}`}
                    </Text>
                </View>
            );
        }

        return <React.Fragment>{mainPane}</React.Fragment>;
    }
}

const lightThemeGradient = ['#FAB57F', 'orange', '#ee7600'];
const darkThemeGradient = ['#33194d', '#261339', 'black'];

const styles = StyleSheet.create({
    container: {
        paddingBottom: 50,
        paddingLeft: 10
    },
    loadingContainer: {
        backgroundColor: 'rgba(253, 164, 40, 0.5)',
        paddingTop: 10,
        paddingBottom: 50,
        paddingLeft: 10
    },
    loadingContainerDark: {
        backgroundColor: '#261339',
        paddingTop: 10,
        paddingBottom: 50,
        paddingLeft: 10
    },
    errorContainer: {
        backgroundColor: '#cc3300', // dark red
        paddingTop: 25,
        paddingBottom: 50,
        paddingLeft: 10
    },
    errorContainerDark: {
        backgroundColor: '#992600', // dark dark red
        paddingTop: 25,
        paddingBottom: 50,
        paddingLeft: 10
    },
    lightningBalance: {
        fontSize: 40,
        color: '#fff'
    },
    blockchainBalance: {
        fontSize: 30,
        color: '#fff'
    },
    pendingBalance: {
        fontSize: 20,
        color: '#fff'
    },
    settings: {},
    nodeInfo: {
        alignItems: 'flex-start',
        marginLeft: -15
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: -30
    }
});
