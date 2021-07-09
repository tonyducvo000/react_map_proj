import React from 'react'


const StateDisplay = (props) => {
    const { robotState, robotStateStore } = props;

    return (

        <div className="stateDisplay">

            <p><b>Robot D01</b> current state: {robotState.D01} - {robotStateStore[robotState.D01]}</p>
            <p><b>Robot D02</b> current state: {robotState.D02} - {robotStateStore[robotState.D02]}</p>
            <p><b>Robot D03</b> current state: {robotState.D03} - {robotStateStore[robotState.D03]}</p>
            <p><b>Robot D04</b> current state: {robotState.D04} - {robotStateStore[robotState.D04]}</p>
            <p><b>Robot D05</b> current state: {robotState.D05} - {robotStateStore[robotState.D05]}</p>
        </div>

    );
}

export default StateDisplay;