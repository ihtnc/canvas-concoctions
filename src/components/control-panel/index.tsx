import { useState } from "react"

type ControlPropValue<T extends string | number | boolean | object> = T | (() => T);

type BaseControlItem = {
  type: "button" | "text" | "label",
  hidden?: ControlPropValue<boolean>,
  disabled?: ControlPropValue<boolean>,
  title?: ControlPropValue<string>,
  className?: ControlPropValue<string>
};

interface ButtonControlItem extends BaseControlItem {
  type: "button",
  onClickHandler: OnClickHandler,
  content: JSX.Element,
  name?: string
}

interface TextInputControlItem extends BaseControlItem {
  type: "text"
  name: string,
  onInputHandler: OnInputHandler,
  placeholder?: ControlPropValue<string>,
  value?: ControlPropValue<string>
}

interface LabelControlItem extends BaseControlItem {
  type: "label",
  content: JSX.Element,
  for?: string,
}

export type OnClickHandler = () => void;
export type OnInputHandler = (value: string) => void;
export type ControlItem = ButtonControlItem | TextInputControlItem | LabelControlItem;

type ControlPanelProps = {
  className?: string,
  controls: Array<ControlItem>
};

type GetPropValueFunction = <T extends string | number | boolean | object>(value?: ControlPropValue<T>, defaultValue?: T) => T | undefined;

const ControlPanel = ({ className, controls }: ControlPanelProps) => {
  const [_, setLastRenderDate] = useState<Date>(new Date())
  let controlCount = 0

  const forceRerender = () => setLastRenderDate(new Date())

  const getPropValue: GetPropValueFunction = (value, defaultValue) => {
    if (typeof value === 'function') { return value() }
    else if (value !== undefined) { return value }
    else return defaultValue
  }

  const getControl = (c: ControlItem) => {
    if (getPropValue(c.hidden, false)) { return undefined }

    if (c.type === "button") {
      const btn = c as ButtonControlItem
      return (<button key={btn.name ?? `button${controlCount++}`}
        onClick={() => {
          forceRerender()
          btn.onClickHandler()
        }}
        name={btn.name}
        title={getPropValue(btn.title)}
        disabled={getPropValue(btn.disabled, false)}
        className={`flex ${getPropValue(btn.className, '')}`}>
        {btn.content}
      </button>)
    }

    if (c.type === "text") {
      const txt = c as TextInputControlItem
      return (<input key={txt.name} type='text' name={txt.name}
        value={getPropValue(txt.value, '')}
        onInput={(e) => {
          txt.onInputHandler(e.currentTarget.value)
          forceRerender()
        }}
        title={getPropValue(txt.title)}
        placeholder={getPropValue(txt.placeholder)}
        disabled={getPropValue(txt.disabled, false)}
        className={`flex ${getPropValue(txt.className, '')}`}
      />)
    }

    if (c.type === "label") {
      const lbl = c as LabelControlItem
      return (<label key={`label${controlCount++}`}
        htmlFor={lbl.for}
        title={getPropValue(lbl.title)}
        className={`flex ${getPropValue(lbl.className, '')}`}>
          {lbl.content}
      </label>)
    }
  }

  return <div className={`flex gap-4 ${className ?? ''}`}>
    {controls.map(getControl)}
  </div>
}

export default ControlPanel