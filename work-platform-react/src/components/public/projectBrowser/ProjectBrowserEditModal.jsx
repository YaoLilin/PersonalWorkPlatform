import {useContext, useEffect, useRef, useState} from "react";
import {Modal, Spin} from "antd";
import ProjectForm from "../../project/Form";
import {ProjectApi} from "../../../request/projectApi";
import {MessageContext} from "../../../provider/MessageProvider";

/**
 * 在项目浏览框中编辑已关联的项目。
 *
 * @param {Object} props 组件参数
 * @param {number|null} props.projectId 当前项目编号
 * @param {Function} props.onClose 关闭回调
 * @param {Function} props.onSaved 保存后的回调
 * @returns {JSX.Element} 项目编辑弹窗
 */
const ProjectBrowserEditModal = ({projectId, onClose, onSaved}) => {
    const messageApi = useContext(MessageContext);
    const formRef = useRef(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    /** 打开弹窗时获取项目完整信息，供现有项目表单编辑。 */
    useEffect(() => {
        if (!projectId) {
            setProject(null);
            return;
        }
        let active = true;
        setLoading(true);
        ProjectApi.getProject(projectId).then((result) => {
            if (active) setProject(result);
        }).catch((error) => {
            if (active) messageApi.error(error?.message || "获取项目失败");
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => { active = false; };
    }, [messageApi, projectId]);

    const saveProject = async (values) => {
        setSaving(true);
        try {
            await ProjectApi.updateProject(projectId, values);
            messageApi.success("保存成功");
            onSaved({...project, ...values});
            onClose();
        } catch (error) {
            messageApi.error(error?.response?.data?.message || error?.message || "保存项目失败");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            className="project-form-modal"
            title="编辑项目"
            open={Boolean(projectId)}
            centered
            destroyOnClose
            width={760}
            styles={{body: {maxHeight: "calc(100dvh - 220px)", overflowY: "auto"}}}
            confirmLoading={saving}
            onCancel={onClose}
            onOk={() => formRef.current?.submit()}
            okText="保存"
            cancelText="取消"
        >
            <Spin spinning={loading}>
                {project && <ProjectForm
                    data={project}
                    type="edit"
                    onSubmit={saveProject}
                    hideNavigation
                    hideSubmitButton
                    onFormReady={(form) => { formRef.current = form; }}
                />}
            </Spin>
        </Modal>
    );
};

export default ProjectBrowserEditModal;
