import {Button, Tree, Modal, Input} from "antd";
import {addType, deleteType, getTypeTree, updateType} from "../../request/typeApi";
import {useLoaderData, useNavigate} from "react-router-dom";
import {ExclamationCircleFilled, FormOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {useContext, useState} from "react";
import {MessageContext} from "../../provider/MessageProvider";
import TypeAddDialogContent from "../../components/type/TypeAddDialogContent";
import TypeEditDialogContent from "../../components/type/TypeEditDialogContent";


const {confirm} = Modal;

export async function loader({params}) {
    return await getTypeTree(params);
}

const TypeEdit =  () => {
    const data = useLoaderData();
    const navigate = useNavigate();
    const [disableDelete, setDisableDelete] = useState(true);
    const [selectedKeys,setSelectedKeys] = useState([]);
    const messageApi = useContext(MessageContext);

    const handelCheck = (checkedKeys) => {
        setDisableDelete(checkedKeys.checked.length === 0);
        setSelectedKeys(checkedKeys.checked);
    };

    const handelDeleteType = () => {
        confirm({
            title: '确定要删除吗？',
            icon: <ExclamationCircleFilled/>,
            content: '',
            onOk() {
                deleteType(selectedKeys).then(result =>{
                    messageApi.success('删除成功',5);
                    navigate('/type');
                }).catch(err =>{
                    messageApi.error('删除失败',5);
                })
            }
        });
    }

    const handelAddType = (inputName,parentId) => {
        if (!inputName) {
            return;
        }
        addType({name:inputName,parentId:parentId}).then(result =>{
            messageApi.success('添加成功',5);
            navigate('/type');
        }).catch(error =>{
            messageApi.error('添加失败',5);
        })

    }

    const handelEditType = (inputName,id,parentId)=>{
        if (!inputName) {
            return;
        }
        updateType(id,{id:id,name:inputName,parentId}).then(result =>{
            messageApi.success('更新成功',5);
            navigate('/type');
        }).catch(error =>{
            messageApi.error('更新失败',5);
        })
    }

    const handelDrop = (info) =>{
        const newParent = info.node.key;
        const name = info.dragNode.title;
        const key = info.dragNode.key;
        updateType(key,{id:key,name:name,parentId:newParent}).then(result =>{
            navigate('/type');
        }).catch(error =>{
            messageApi.error('更新失败',5);
        })
    }

    const showAddDialog=(node) =>{
        const title = '添加类型';
        const icon = <PlusCircleOutlined/>;
        let inputName='';
        confirm({
            title,
            icon,
            content: (
                <TypeAddDialogContent onChange={(e)=>inputName = e.target.value }/>
            ),
            onOk() {
                handelAddType(inputName, node?.key);
            }
        });
    }

    const showEditDialog = (node)=> {
        const title = '编辑名称';
        const icon = <FormOutlined/>;
        let inputName=node?.title;
        let parentNode = getParentNode(data,node.key);
        confirm({
            title,
            icon,
            content: (
                <TypeEditDialogContent name={inputName}
                                       parentNode={getParentNode(data,node.key)}
                                       onNameChange={e => inputName = e.target.value}
                                       onNodeSelectorChanged={(node)=> parentNode = node} />
            ),
            onOk() {
                handelEditType(inputName,node?.key,parentNode);
            }
        });
    }

    const getParentNode = (data,nodeKey)=>{
        return  searchChildren(data, nodeKey, null);
    }

    const searchChildren =(children,nodeKey,parentKey) =>{
        for (let j = 0; j < children.length; j++) {
            if (children[j].key === nodeKey) {
                return parentKey;
            }
            const key = searchChildren(children[j].children, nodeKey,children[j].key);
            if (key !== null) {
                return  key;
            }
        }
        return null;
    }

    return (
        <div style={{padding: "20px", backgroundColor: "white", borderRadius: "12px"}}>
            <div style={{display:'flex'}}>
                <Button disabled={disableDelete} onClick={handelDeleteType}>删除</Button>
                <Button onClick={()=>showAddDialog(null)} style={{marginLeft:10}}>添加</Button>
            </div>

            <Tree checkable
                  draggable={{icon:false}}
                  defaultExpandAll
                  onCheck={handelCheck}
                  treeData={data}
                  onDrop={handelDrop}
                  checkStrictly
                  titleRender={(nodeData) => {
                return (
                    <div className={'tree_title'}>
                        <span>{nodeData.title}</span>
                        <PlusCircleOutlined className={'tree_bt'} onClick={() => showAddDialog(nodeData)}/>
                        <FormOutlined className={'tree_bt'} onClick={()=> showEditDialog(nodeData)}/>
                    </div>)
            }}/>
        </div>
    )
}

export  {TypeEdit as TypeEditPage};
