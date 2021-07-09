import React from 'react'


const ControlPanel = (props) => {
    const { currentRobotSelect, handleChangeRobot, handleStateChange, stateSelected } = props;

    return (


        <div className="controlPanel">

            <form name="robotChoice">
                <label>
                    <b>Robot:</b>
                    <select value={currentRobotSelect} onChange={handleChangeRobot}
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
                    <select value={stateSelected} onChange={handleStateChange}
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



    );
}

export default ControlPanel;