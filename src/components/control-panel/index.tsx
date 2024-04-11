import { type ReactNode, type Key, useState } from "react";

export type ControlItem = {
  key?: Key | null,
  onClickHandler: () => void,
  hidden?: boolean | (() => boolean),
  disabled?: boolean | (() => boolean),
  title?: string,
  className?: string,
  component: ReactNode
};

type ControlPanelProps = {
  className?: string,
  controls: Array<ControlItem>
};

const ControlPanel = ({ className, controls }: ControlPanelProps) => {
  const getValue = (value: boolean | (() => boolean) | undefined, defaultValue: boolean = false): boolean => {
    if (value === undefined) { return defaultValue; }
    else if (typeof value === "boolean") { return value; }
    else return value();
  };
  const [_, setLastRerender] = useState<Date>(new Date());
  let controlCount = 0;
  return <div className={`flex self-center gap-4 ${className}`}>
    {controls.map(c => {
      return (getValue(c.hidden) === false && <button key={c.key ?? controlCount++}
        onClick={() => {
          setLastRerender(new Date());
          c.onClickHandler();
        }}
        title={c.title}
        disabled={getValue(c.disabled)}
        className={`flex ${c.className}`}>
        {c.component}
      </button>);
    })}
  </div>;
};

export default ControlPanel;