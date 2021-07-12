import React from 'react'


const StateDisplay = (props) => {
    const { robotState, robotStateStore, base_keys_robots } = props;

    return (

        <div className="stateDisplay">

            {base_keys_robots.map((keys) => {
                return (
                    <p><b>Robot {keys}</b> current state: {robotState[keys]} - {robotStateStore[robotState[keys]]}</p>
                )

            })}

        </div>

    );
}

export default StateDisplay;