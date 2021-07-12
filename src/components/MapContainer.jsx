import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import RobotDataDisplay from './robotDataDisplay';
import ProductInfoDisplay from './productInfoDisplay';
import StateDisplay from './stateDisplay'
import convertTime from './helper/convertTime'
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

    constructor(props) {
        super(props);

        this.state = {
            apiKey: GOOGLE_MAP_API_KEY,
            currentRobotSelect: "D01",
            showInfoWindow: false,
            robotStateStore: {
                0: "Available.",
                1: "On way to store.",
                2: "At store.",
                3: "On way to customer.",
                4: "At customer.",
                5: "On way back to store.",
                6: "Needs attention!",
                7: "Needs repair!",
                8: "SOS!",
            },

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
        cameraNotWorkingArr = this.getCameraData(database.robots[robotID].diagnostics.cameraDataWorking);
        cellStrength = (database.robots[robotID].diagnostics.cellStrength * 100) + "% signal strength";
        ////

        var availableCarrierObj = database.robots[robotID].diagnostics.carrierAvail;
        var keysCarrier = Object.keys(database.robots[robotID].diagnostics.carrierAvail);

        var availableCarrierArr = keysCarrier.filter(function (key) {
            return availableCarrierObj[key];
        });

        if (availableCarrierArr.length === 0) {
            availableCarrier = "No carrier is available!";
        } else {
            availableCarrier = availableCarrierArr.toString().replace(",", ", ");
        }


        robotStateNumber = this.state.robotState[robotID];
        robotStateRendered = this.state.robotStateStore[robotStateNumber];


        if (database.robots[robotID].assignedOrderId !== "") {
            orderID = database.robots[robotID].assignedOrderId;
            orderedItems = database.orders[orderID].items.toString().replace(",", ", ");
            totalPrice = "$" + database.orders[orderID].totalPrice;
            minutesSinceOrdered = convertTime(database.orders[orderID].minutesSinceOrderPlaced)

        } else {
            orderID = "Available";
            orderedItems = "N/A";
            totalPrice = "N/A";
            minutesSinceOrdered = "N/A";
        }


        if (cameraNotWorkingArr === "") {
            cameraNotWorkingArr = "All cameras are functioning.";
        } else {
            cameraNotWorkingArr = "Camera(s) " + cameraNotWorkingArr.toString().replace(",", ", ") + " are broken!"
        }


        this.onMarkerClick(e, props, marker, robotID, batteryLife, velocity,
            cameraNotWorkingArr, cellStrength, availableCarrier, robotStateNumber,
            robotStateRendered, orderID, orderedItems, minutesSinceOrdered, totalPrice);

    }

    getCameraData = (cameraData) => {
        var indexes = [], i = -1;
        while ((i = cameraData.indexOf(false, i + 1)) !== -1) {
            indexes.push(i);
        }
        return indexes;
    }

    onMarkerClick = (props, marker, e, robotID, batteryLife, velocity,
        cameraNotWorkingArr, cellStrength, availableCarrier, robotStateNumber, robotStateRendered, orderID,
        orderedItems, minutesSinceOrdered, totalPrice) => this.setState({

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


            orderID: orderID,
            orderedItems: orderedItems,
            minutesSinceOrdered: minutesSinceOrdered,
            totalPrice: totalPrice
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
            orderedItems, totalPrice, robotState, robotStateStore, currentRobotSelect, stateSelected } = this.state;

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
                    robotStateStore={robotStateStore}
                    base_keys_robots={base_keys_robots}
                >

                </StateDisplay>

                <ControlPanel
                    currentRobotSelect={currentRobotSelect}
                    handleChangeRobot={this.handleChangeRobot}
                    handleStateChange={this.handleStateChange}
                    stateSelected={stateSelected}
                    base_keys_robots={base_keys_robots}

                >
                </ControlPanel>

            </React.Fragment >

        );
    }
}

export default GoogleApiWrapper(
    { apiKey: GOOGLE_MAP_API_KEY }
)(MapContainer);