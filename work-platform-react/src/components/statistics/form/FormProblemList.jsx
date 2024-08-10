import {Row} from "antd";
import SeparatorText from "../../ui/SeparatorText";
import ProblemList from "./ProblemList";
import React from "react";
import PropTypes, {bool} from "prop-types";

const FormProblemList = ({
                             isFormCreate,
                             theWeekProblems,
                             nowProblems,
                             weekValue,
                             onTheWeekProblemsListChange,
                             onNowProblemsListChange,
                             editAble = false
                         }) => {

    return (
        <div>
            {!isFormCreate ?
                <>
                    <Row>
                        <SeparatorText text={'本周产生的问题'}/>
                    </Row>
                    <Row>
                        <ProblemList data={theWeekProblems}
                                     onChange={onTheWeekProblemsListChange}
                                     editAble={true}
                                     addAble={editAble}
                                     week={weekValue}/>
                    </Row>
                    <Row>
                        <SeparatorText text={'现有问题'} style={{marginTop: '10px'}}/>
                        <ProblemList data={nowProblems}
                                     onChange={onNowProblemsListChange}
                                     editAble={true}
                                     week={weekValue}/>
                    </Row>
                </> : null
            }
            {isFormCreate ?
                <Row>
                    <ProblemList data={theWeekProblems}
                                 onChange={onTheWeekProblemsListChange}
                                 defaultEdit
                                 week={weekValue}/>
                </Row>
                : null
            }
        </div>
    )
}
FormProblemList.prototype={
    isFormCreate:PropTypes.bool.isRequired,
    theWeekProblems:PropTypes.array.isRequired,
    nowProblems:PropTypes.array.isRequired,
    weekValue:PropTypes.number.isRequired,
    onTheWeekProblemsListChange:PropTypes.func.isRequired,
    onNowProblemsListChange:PropTypes.func.isRequired,
    editAble:PropTypes.bool.isRequired,
}

export default FormProblemList;