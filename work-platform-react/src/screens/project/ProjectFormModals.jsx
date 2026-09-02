import React from "react";
import {Modal} from "antd";
import ProjectForm from "../../components/project/Form";
import {DEFAULT_PROJECT_DATA} from "./projectListUtils";

/**
 * <p>项目新增和编辑弹窗。</p>
 *
 * @param {Object} props 组件参数
 * @param {boolean} props.isCreateModalOpen 是否显示新增弹窗
 * @param {Object | null} props.editingProject 正在编辑的项目
 * @param {Object} props.createProjectFormRef 新增表单引用
 * @param {Object} props.editProjectFormRef 编辑表单引用
 * @param {Function} props.onCreateModalClose 关闭新增弹窗的回调
 * @param {Function} props.onEditModalClose 关闭编辑弹窗的回调
 * @param {Function} props.onCreateProject 提交新增项目的回调
 * @param {Function} props.onUpdateProject 提交编辑项目的回调
 * @returns {JSX.Element} 项目表单弹窗
 */
const ProjectFormModals = ({
    isCreateModalOpen,
    editingProject,
    createProjectFormRef,
    editProjectFormRef,
    onCreateModalClose,
    onEditModalClose,
    onCreateProject,
    onUpdateProject,
}) => (
    <>
        <Modal
            title="添加项目"
            open={isCreateModalOpen}
            destroyOnClose
            onCancel={onCreateModalClose}
            onOk={() => createProjectFormRef.current?.submit()}
            okText="保存"
            cancelText="取消"
            width={760}
        >
            <ProjectForm
                data={DEFAULT_PROJECT_DATA}
                type="create"
                onSubmit={onCreateProject}
                hideNavigation
                hideSubmitButton
                onFormReady={(form) => createProjectFormRef.current = form}
            />
        </Modal>
        <Modal
            title="编辑项目"
            open={Boolean(editingProject)}
            destroyOnClose
            onCancel={onEditModalClose}
            onOk={() => editProjectFormRef.current?.submit()}
            okText="保存"
            cancelText="取消"
            width={760}
        >
            {editingProject && (
                <ProjectForm
                    data={editingProject}
                    type="edit"
                    onSubmit={onUpdateProject}
                    hideNavigation
                    hideSubmitButton
                    onFormReady={(form) => editProjectFormRef.current = form}
                />
            )}
        </Modal>
    </>
);

export default ProjectFormModals;
