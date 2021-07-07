import React, { Component } from 'react';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
//import MarkerHandler from './components/marker_handler';
//import DataDisplay from './DataDisplay'
import database from './database_cocos.json';
import './MapContainer.scss';
import convertTime from './helper/convertTime'
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

    // convertTime(minutesSinceOrderPlaced) {
    //     var hours = Math.floor((minutesSinceOrderPlaced) / 60);
    //     var seconds = Math.ceil((minutesSinceOrderPlaced * 360) % 60);

    //     if (hours > 0) {
    //         var minutes = minutesSinceOrderPlaced % 60;
    //         return hours + " hour(s) and " + minutes + " minutes ago and " + seconds + " ago";
    //     } else {
    //         var minutes = (minutesSinceOrderPlaced - (((minutesSinceOrderPlaced * 60) % 60) / 60));
    //         return minutes + " minutes and " + seconds + " seconds ago";
    //     }

    // }

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
        return (
            <React.Fragment>
                <div className="mapContainer">

                    <Map
                        onClick={this.onClose}
                        google={this.props.google}
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

                        {
                            R.zip(base_keys_robots, base_values_robots).map((data) => {

                                return (
                                    <Marker label={data[0]} title={data[0]} onClick={this.parseAndHandleClick}
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

                            <h3>Robot Status:</h3>

                            <p><b>RobotID:</b>  {this.state.robotID}</p>

                            <p><b>Velocity:</b> {this.state.velocity} </p>

                            <p><b>Battery Remaining: </b>{this.state.batteryLife}</p>

                            <p><b>Camera data: </b>{this.state.cameraNotWorkingArr}</p>


                            {<p><b>Current state: </b>{this.state.robotStateNumber} - {this.state.robotStateRendered}</p>}


                            <p><b>-------------------------------</b></p>

                            <h3>Order Information:</h3>

                            <p><b>OrderID: </b>{this.state.orderID}</p>

                            <p><b>Minutes since order: </b>{this.state.minutesSinceOrdered}</p>

                            <p><b>Items ordered: </b>{this.state.orderedItems}</p>

                            <p><b>Total price: </b>{this.state.totalPrice}</p>


                        </InfoWindow>
                    </Map>
                </div>

                <div className="stateDisplay">

                    <p><b>Robot D01</b> current state: {this.state.robotState.D01} - {this.state.robotStateStore[this.state.robotState.D01]}</p>
                    <p><b>Robot D02</b> current state: {this.state.robotState.D02} - {this.state.robotStateStore[this.state.robotState.D02]}</p>
                    <p><b>Robot D03</b> current state: {this.state.robotState.D03} - {this.state.robotStateStore[this.state.robotState.D03]}</p>
                    <p><b>Robot D04</b> current state: {this.state.robotState.D04} - {this.state.robotStateStore[this.state.robotState.D04]}</p>
                    <p><b>Robot D05</b> current state: {this.state.robotState.D05} - {this.state.robotStateStore[this.state.robotState.D05]}</p>
                </div>

                <div className="controlPanel">

                    <form name="robotChoice">
                        <label>
                            <b>Robot:</b>
                            <select value={this.state.currentRobotSelect} onChange={this.handleChangeRobot}
                                name="robotChoiceDropdown" id="robotChoiceDropDown">
                                <option value="D01">D01</option>
                                <option value="D02">D02</option>
                                <option value="D03">D03</option>
                                <option value="D04">D04</option>
                                <option value="D05">D05</option>
                            </select>
                        </label>

                        <label>
                            <b>State:</b>
                            <select value={this.state.stateSelected} onChange={this.handleStateChange}
                                name="stateSelectDropDown" id="stateSelectDropDown">
                                <option value="0">0:  Available</option>
                                <option value="1">1:  On way to store</option>
                                <option value="2">2:  At store</option>
                                <option value="3">3:  On way to customer</option>
                                <option value="4">4:  At customer</option>
                                <option value="5">5:  On way back to store</option>
                                <option value="6">6:  Needs attention</option>
                                <option value="7">7:  Needs repair</option>
                                <option value="8">8:  SOS!</option>

                            </select>
                        </label>

                    </form>

                </div>


            </React.Fragment >

        );
    }
}

export default GoogleApiWrapper({
    apiKey: process.env.REACT_APP_SECRET_KEY
})(MapContainer);