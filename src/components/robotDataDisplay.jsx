import React from 'react'


const RobotDataDisplay = (props) => {
    const { robotID, velocity, batteryLife, cameraNotWorkingArr, robotStateRendered, robotStateNumber } = props;
    return (
        <React.Fragment>

            <h3>Robot Status:</h3>
            <p><b>RobotID:</b>  {robotID}</p>

            <p><b>Velocity:</b> {velocity} </p>

            <p><b>Battery Remaining: </b>{batteryLife}</p>

            <p><b>Camera data: </b>{cameraNotWorkingArr}</p>

            {<p><b>Current state: </b>{robotStateNumber} - {robotStateRendered}</p>}

        </React.Fragment>
    );
}

export default RobotDataDisplay;

