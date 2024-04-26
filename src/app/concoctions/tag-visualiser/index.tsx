'use client';

import { type DrawHandler } from "@/components/canvas/types";
import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas";
import ControlPanel, { type OnChangeHandler, type ControlItem } from "@/components/control-panel";
import TrashIcon from "@/components/icons/trash-icon";
import TagIcon from "@/components/icons/tag-icon";
import PlusCircleIcon from "@/components/icons/plus-circle-icon";

type TagVisualiserProps = {
  className?: string
};

const TagVisualiser = ({ className }: TagVisualiserProps) => {
  let tagInput: string;

  const drawFn: DrawHandler = ({ context, frame }) => {
    context.fillStyle = '#000000';
    context.beginPath();
    context.arc(50, 50, 20*Math.sin(frame*0.05)**2, 0, 2*Math.PI);
    context.fill();
  };

  const updateTagInput: OnChangeHandler = (value) => {
    tagInput = value;
  };

  const addTag = () => {
    console.log(tagInput);
    tagInput = '';
  }

  const resetConcoction = () => {

  };

  const { Canvas } = useAnimatedCanvas({
    draw: drawFn,
    renderEnvironmentLayerRenderer: true
  });

  const controls: Array<ControlItem> = [{
    type: "label",
    content: (<TagIcon />),
    for: "tag"
  }, {
    type: "text",
    onChangeHandler: updateTagInput,
    name: "tag",
    placeholder: "Enter tag",
    value: () => tagInput
  }, {
    type: "button",
    onClickHandler: addTag,
    content: (<PlusCircleIcon />),
    title: "Add tag"
  }, {
    type: "button",
    onClickHandler: resetConcoction,
    content: (<TrashIcon />),
    title: "Reset canvas",
    className: "ml-auto"
  }];

  return <div className="flex flex-col w-full h-full gap-2">
    <Canvas className={className} />
    <ControlPanel controls={controls} className="w-full" />
  </div>;
};

export const NavigationDetails: ConcoctionNavigation = {
  linkTitle: 'Tag Visualiser',
  linkUrl: 'tag-visualiser',
  title: 'Tag Visualiser'
};

export default TagVisualiser;