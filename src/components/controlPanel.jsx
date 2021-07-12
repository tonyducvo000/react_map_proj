import React from 'react'


const ControlPanel = (props) => {
    const { currentRobotSelect, handleChangeRobot, handleStateChange,
        stateSelected, base_keys_robots, robotStateStore } = props;

    return (


        <div className="controlPanel">

            <form name="robotChoice">
                <label>

                    <b>Robot:</b>
                    <select value={currentRobotSelect} onChange={handleChangeRobot}
                        name="robotChoiceDropdown" id="robotChoiceDropDown">

                        {base_keys_robots.map((keys) => {
                            return (
                                <option value={keys}>{keys}</option>
                            );
                        })}

                    </select>

                </label>

                <label>
                    <b>State:</b>
                    <select value={stateSelected} onChange={handleStateChange}
                        name="stateSelectDropDown" id="stateSelectDropDown">

                        {
                            Object.keys(robotStateStore).map((robotKeys) => {
                                return (
                                    <option value={robotKeys}>{robotKeys}: {robotStateStore[robotKeys]} </option>
                                );
                            })
                        }

                    </select>
                </label>

            </form>

        </div>



    );
}

export default ControlPanel;