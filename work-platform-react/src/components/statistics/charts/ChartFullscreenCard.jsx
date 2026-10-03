import {Button, Card} from "antd";
import {FullscreenExitOutlined, FullscreenOutlined} from "@ant-design/icons";
import {useEffect, useState} from "react";

/**
 * 带全屏对话框模式的统计图卡片。
 *
 * @param {{title: string, children: React.ReactNode}} props 卡片标题及包含条件组的图表。
 * @returns {JSX.Element} 可在卡片和全屏对话框间切换的统计图。
 */
const ChartFullscreenCard = ({title, children}) => {
    const [expanded, setExpanded] = useState(false);

    // 全屏时锁定页面滚动，支持 Escape 关闭并通知图表重新计算尺寸。
    useEffect(() => {
        if (!expanded) {
            return undefined;
        }
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setExpanded(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        const frame = window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            window.requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
        };
    }, [expanded]);

    return (
        <>
            {expanded && <div className="chart-page__backdrop" onClick={() => setExpanded(false)}/>}
            <Card
                aria-label={expanded ? title : undefined}
                aria-modal={expanded ? "true" : undefined}
                className={`chart-page__card${expanded ? " chart-page__card--fullscreen" : ""}`}
                extra={
                    <Button
                        aria-label={expanded ? `缩小${title}` : `放大${title}`}
                        icon={expanded ? <FullscreenExitOutlined/> : <FullscreenOutlined/>}
                        onClick={() => setExpanded(!expanded)}
                        type="text"
                    />
                }
                role={expanded ? "dialog" : undefined}
                title={title}
            >
                {children}
            </Card>
        </>
    );
};

export default ChartFullscreenCard;
