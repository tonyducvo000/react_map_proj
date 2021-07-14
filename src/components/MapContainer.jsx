import React, { Component } from 'react';
import { Map, GoogleApiWrapper, InfoWindow } from 'google-maps-react';
import RobotDataDisplay from './robotDataDisplay';
import ProductInfoDisplay from './productInfoDisplay';
import StateDisplay from './stateDisplay'
import convertTime from './helper/convertTime'
import getBrokenCameraData from './helper/getCameraData'
import ControlPanel from './controlPanel'
import Markers from './markers';

import database from './database_cocos.json';
import GOOGLE_MAP_API_KEY from '../key/my_key'
import './MapContainer.scss';

//gets key and values of robots
const base_keys_robots = Object.keys(database.robots);
const base_values_robots = Object.values(database.robots);

const mapStyles = {
    width: '58%',
    height: '55%'
};

class MapContainer extends Component {

    robotStateStore = {
        0: "Available.",
        1: "On way to store.",
        2: "At store.",
        3: "On way to customer.",
        4: "At customer.",
        5: "On way back to store.",
        6: "Needs attention!",
        7: "Needs repair!",
        8: "SOS!",
    }

    constructor(props) {
        super(props);

        this.state = {
            currentRobotSelect: "D01",
            showInfoWindow: false,

            robotState: {
                D01: database.robots.D01.state,
                D02: database.robots.D02.state,
                D03: database.robots.D03.state,
                D04: database.robots.D04.state,
                D05: database.robots.D05.state,
            }
        };

    }

    componentDidMount() {

    }

    parseAndHandleClick = (e, props, marker, robotID,
        cameraNotWorkingArr,

        orderID, orderedItems, minutesSinceOrdered, subTotal, tax, totalPrice) => {

        robotID = e.title;

        this.getGeneralData(robotID);
        this.getStateData(robotID);
        this.getCarrierData(robotID);
        this.getCameraData(cameraNotWorkingArr, robotID);
        this.getProductData(orderID, orderedItems, subTotal, tax, totalPrice, minutesSinceOrdered, robotID);
        this.onMarkerClick(e, props, marker);
    }

    getGeneralData = (robotID) => {
        const { battery, velocity: robotVelocity } = database.robots[robotID].diagnostics;

        var batteryLife = (battery * 100) + "% remaining";
        var velocity = robotVelocity + " miles per hour";
        this.setState({ batteryLife, velocity, robotID })
    }

    getStateData = (robotID) => {
        var robotStateNumber = this.state.robotState[robotID];
        var robotStateRendered = this.robotStateStore[robotStateNumber];
        this.setState({ robotStateNumber, robotStateRendered })
    }

    getCarrierData = (robotID) => {
        const { cellStrength, carrierAvail } = database.robots[robotID].diagnostics;

        var cellData = (cellStrength * 100) + "% signal strength";

        var availableCarrierObj = carrierAvail;
        var keysCarrier = Object.keys(carrierAvail);

        var availableCarrierArr = keysCarrier.filter(function (key) {
            return availableCarrierObj[key];
        });

        var availableCarrier = availableCarrierArr.length === 0 ? "No carrier is available!" :
            availableCarrier = availableCarrierArr.toString().replace(",", ", ");

        this.setState({ availableCarrier, cellStrength: cellData });
    }

    getCameraData = (cameraNotWorkingArr, robotID) => {
        const { cameraDataWorking } = database.robots[robotID].diagnostics;

        cameraNotWorkingArr = getBrokenCameraData(cameraDataWorking);

        cameraNotWorkingArr.length === 0 ? cameraNotWorkingArr = "All cameras are functioning." :
            cameraNotWorkingArr = "Camera #" + cameraNotWorkingArr.toString().replace(",", ", #") + " is broken!";

        this.setState({ cameraNotWorkingArr });
    }

    getProductData = (orderID, orderedItems, subTotal, tax, totalPrice, minutesSinceOrdered, robotID) => {
        const { orders } = database
        const { assignedOrderId } = database.robots[robotID];

        if (assignedOrderId !== "") {
            orderID = assignedOrderId;
            orderedItems = orders[orderID].items.toString().replace(",", ", ");
            subTotal = "$" + orders[orderID].subtotalPrice;
            tax = "$" + (orders[orderID].totalPrice - orders[orderID].subtotalPrice).toFixed(2);
            totalPrice = "$" + orders[orderID].totalPrice;
            minutesSinceOrdered = convertTime(orders[orderID].minutesSinceOrderPlaced);

        } else {
            orderID = "Available";
            orderedItems = "N/A";
            subTotal = "N/A";
            tax = "N/A";
            totalPrice = "N/A";
            minutesSinceOrdered = "N/A";
        }
        this.setState({ orderID, orderedItems, subTotal, tax, totalPrice, minutesSinceOrdered })
    }

    onMarkerClick = (props, marker, e) => this.setState({
        activeRobot: marker,
        selectedRobot: props,
        showInfoWindow: true,
    });

    handleChangeRobot = (event) => {
        const { robotState } = this.state;
        const { value } = event.target;
        this.setState({ currentRobotSelect: value, stateSelected: robotState[value] });
    }

    handleStateChange = (event) => {
        const { currentRobotSelect } = this.state;
        const { value } = event.target;
        //clone the object then update the key's value of robotState
        const robotStateClone = { ...this.state.robotState };
        robotStateClone[currentRobotSelect] = value;
        this.setState({ robotState: robotStateClone, stateSelected: value });
    }

    onClose = () => {
        if (this.state.showInfoWindow) {
            this.setState({
                showInfoWindow: false,
                activeMarker: null
            });
        }
    };

    render() {
        const { google } = this.props;

        const { robotID, velocity, batteryLife, cameraNotWorkingArr,
            robotStateNumber, robotStateRendered, orderID, minutesSinceOrdered,
            orderedItems, subTotal, tax, totalPrice, robotState, currentRobotSelect, stateSelected,
            cellStrength, availableCarrier, activeRobot, showInfoWindow } = this.state;

        const coords = { lat: 33.91708814912447, lng: -118.38704987546402 };

        return (
            <React.Fragment>
                <div className="mapContainer">

                    <Map
                        onClick={this.onClose}
                        google={google}
                        zoom={10}
                        style={mapStyles}
                        initialCenter={coords}
                    >
                        {/* Using <Markers> will not generate markers, 
                        since generated <Marker> will be children of <Markers>.  
                        <Marker> needs to a direct child of <Map> for it to be rendered.  
                        Solution: Use Markers as a function and pass resources as parameter. */}

                        {Markers(base_keys_robots,
                            base_values_robots,
                            this.parseAndHandleClick)}

                        <InfoWindow
                            max-width="400"
                            marker={activeRobot}
                            visible={showInfoWindow}
                            onClose={this.onClose}
                        >
                            <div>
                                <RobotDataDisplay
                                    robotID={robotID}
                                    velocity={velocity}
                                    batteryLife={batteryLife}
                                    cameraNotWorkingArr={cameraNotWorkingArr}
                                    robotStateNumber={robotStateNumber}
                                    robotStateRendered={robotStateRendered}
                                    cellStrength={cellStrength}
                                    availableCarrier={availableCarrier}
                                />

                                <ProductInfoDisplay
                                    orderID={orderID}
                                    minutesSinceOrdered={minutesSinceOrdered}
                                    orderedItems={orderedItems}
                                    subTotal={subTotal}
                                    tax={tax}
                                    totalPrice={totalPrice}
                                />
                            </div>
                        </InfoWindow>
                    </Map>
                </div>


                <StateDisplay
                    robotState={robotState}
                    robotStateStore={this.robotStateStore}
                    base_keys_robots={base_keys_robots}
                />

                <ControlPanel
                    currentRobotSelect={currentRobotSelect}
                    handleChangeRobot={this.handleChangeRobot}
                    handleStateChange={this.handleStateChange}
                    stateSelected={stateSelected}
                    base_keys_robots={base_keys_robots}
                    robotStateStore={this.robotStateStore}

                />

            </React.Fragment >

        );
    }
}

export default GoogleApiWrapper(
    { apiKey: GOOGLE_MAP_API_KEY }
)(MapContainer);