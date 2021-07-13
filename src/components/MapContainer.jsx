import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import RobotDataDisplay from './robotDataDisplay';
import ProductInfoDisplay from './productInfoDisplay';
import StateDisplay from './stateDisplay'
import convertTime from './helper/convertTime'
import getCameraData from './helper/getCameraData'
import ControlPanel from './controlPanel'

//import Markers from './markers'

import database from './database_cocos.json';
import GOOGLE_MAP_API_KEY from '../key/my_key'
import './MapContainer.scss';
const R = require('ramda');

//gets list of robots
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
        batteryLife, velocity, cameraNotWorkingArr,
        cellStrength, availableCarrier, robotStateNumber, robotStateRendered,
        orderID, orderedItems, minutesSinceOrdered, totalPrice) => {

        robotID = e.title;
        batteryLife = (database.robots[robotID].diagnostics.battery * 100) + "% remaining";
        velocity = database.robots[robotID].diagnostics.velocity;
        cameraNotWorkingArr = getCameraData(database.robots[robotID].diagnostics.cameraDataWorking);
        cellStrength = (database.robots[robotID].diagnostics.cellStrength * 100) + "% signal strength";
        ////

        var availableCarrierObj = database.robots[robotID].diagnostics.carrierAvail;
        var keysCarrier = Object.keys(database.robots[robotID].diagnostics.carrierAvail);

        var availableCarrierArr = keysCarrier.filter(function (key) {
            return availableCarrierObj[key];
        });

        //
        if (availableCarrierArr.length === 0) {
            availableCarrier = "No carrier is available!";
        } else {
            availableCarrier = availableCarrierArr.toString().replace(",", ", ");
        }


        robotStateNumber = this.state.robotState[robotID];
        robotStateRendered = this.robotStateStore[robotStateNumber];


        if (cameraNotWorkingArr.length === 0) {
            cameraNotWorkingArr = "All cameras are functioning.";
        } else {
            cameraNotWorkingArr = "Camera(s) " + cameraNotWorkingArr.toString().replace(",", ", ") + " are broken!"
        }


        this.getProductInfo(orderID, orderedItems, totalPrice, minutesSinceOrdered, robotID);
        this.onMarkerClick(e, props, marker, robotID, batteryLife, velocity,
            cameraNotWorkingArr, cellStrength, availableCarrier, robotStateNumber,
            robotStateRendered, orderedItems, minutesSinceOrdered, totalPrice);

    }

    getProductInfo = (orderID, orderedItems, totalPrice, minutesSinceOrdered, robotID) => {

        const { robots, orders } = database

        if (robots[robotID].assignedOrderId !== "") {
            orderID = robots[robotID].assignedOrderId;
            orderedItems = orders[orderID].items.toString().replace(",", ", ");
            totalPrice = "$" + orders[orderID].totalPrice;
            minutesSinceOrdered = convertTime(database.orders[orderID].minutesSinceOrderPlaced);

        } else {
            orderID = "Available";
            orderedItems = "N/A";
            totalPrice = "N/A";
            minutesSinceOrdered = "N/A";
        }
        this.setState({ orderID: orderID, orderedItems, totalPrice, minutesSinceOrdered })
    }

    getCarrierData = () => {


    }

    onMarkerClick = (props, marker, e, robotID, batteryLife, velocity,
        cameraNotWorkingArr, cellStrength, availableCarrier, robotStateNumber, robotStateRendered) => this.setState({

            activeRobot: marker,
            selectedRobot: props,
            showInfoWindow: true,

            robotID: robotID,
            batteryLife: batteryLife,
            velocity: velocity,
            cameraNotWorkingArr: cameraNotWorkingArr,

            cellStrength: cellStrength,
            availableCarrier: availableCarrier,
            robotStateNumber: robotStateNumber,
            robotStateRendered: robotStateRendered,

        });


    handleChangeRobot = (event) => {
        const { robotState } = this.state;
        this.setState({ currentRobotSelect: event.target.value, stateSelected: robotState[event.target.value] });
    }

    handleStateChange = (event) => {

        const { currentRobotSelect } = this.state;
        //clone the object then update the key's value of robotState
        const robotStateClone = { ...this.state.robotState };
        robotStateClone[currentRobotSelect] = event.target.value;
        this.setState({ robotState: robotStateClone, stateSelected: event.target.value });

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
            orderedItems, totalPrice, robotState, currentRobotSelect, stateSelected,
            cellStrength, availableCarrier } = this.state;

        return (
            <React.Fragment>
                <div className="mapContainer">

                    <Map
                        onClick={this.onClose}
                        google={google}
                        zoom={10}
                        style={mapStyles}
                        initialCenter={
                            {
                                // LA Region
                                lat: 33.91708814912447,
                                lng: -118.38704987546402

                            }
                        }
                    >


                        {/* <Markers
                            base_keys_robots={base_keys_robots}
                            base_values_robots={base_values_robots}
                        >
                        </Markers> */}

                        {
                            R.zip(base_keys_robots, base_values_robots).map((data) => {

                                return (
                                    <Marker key={data[0]} label={data[0]} title={data[0]} onClick={this.parseAndHandleClick}
                                        position={{ lat: data[1].location.latitude, lng: data[1].location.longitude }} />
                                )
                            })
                        }

                        <InfoWindow
                            max-width="400"
                            marker={this.state.activeRobot}
                            visible={this.state.showInfoWindow}
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
                                >
                                </RobotDataDisplay>

                                <ProductInfoDisplay
                                    orderID={orderID}
                                    minutesSinceOrdered={minutesSinceOrdered}
                                    orderedItems={orderedItems}
                                    totalPrice={totalPrice}
                                >
                                </ProductInfoDisplay>
                            </div>
                        </InfoWindow>
                    </Map>
                </div>

                <StateDisplay
                    robotState={robotState}
                    robotStateStore={this.robotStateStore}
                    base_keys_robots={base_keys_robots}
                >

                </StateDisplay>

                <ControlPanel
                    currentRobotSelect={currentRobotSelect}
                    handleChangeRobot={this.handleChangeRobot}
                    handleStateChange={this.handleStateChange}
                    stateSelected={stateSelected}
                    base_keys_robots={base_keys_robots}
                    robotStateStore={this.robotStateStore}

                >
                </ControlPanel>

            </React.Fragment >

        );
    }
}

export default GoogleApiWrapper(
    { apiKey: GOOGLE_MAP_API_KEY }
)(MapContainer);