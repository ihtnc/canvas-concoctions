'use client';

import { type PreDrawHandler, type DrawHandler, type PostDrawHandler, RenderLocation } from "@/components/canvas/types";
import { type ConcoctionNavigation } from "@/app/concoctions/utilities";
import useAnimatedCanvas from "@/components/canvas/use-animated-canvas";
import ControlPanel, { type OnChangeHandler, type ControlItem } from "@/components/control-panel";
import TrashIcon from "@/components/icons/trash-icon";
import TagIcon from "@/components/icons/tag-icon";
import PlusCircleIcon from "@/components/icons/plus-circle-icon";
import { useRef } from "react";
import {
  addTag, cleanUpTags, getNewColor, processTags, renderTags,
} from "./engine";
import { renderDebugLayer } from "./debug";
import { type Tags } from "./engine/types";
import PlayIcon from "@/components/icons/play-icon";
import PauseIcon from "@/components/icons/pause-icon";
import ForwardIcon from "@/components/icons/forward-icon";

type TagVisualiserProps = {
  className?: string
};

const TagVisualiser = ({ className }: TagVisualiserProps) => {
  const tags = useRef<Tags>({});
  const existingHues: Array<number> = [];
  let tagInput = '';

  const preDrawFn: PreDrawHandler = (canvas, data) => {
    const current = tags.current;
    const newTags = processTags(data.frame, current);
    tags.current = newTags;
  };

  const drawFn: DrawHandler = ({ context, frame }) => {
    renderTags(
      context,
      tags.current,
      frame,
      [],
      [renderDebugLayer]
    );
  };

  const postDrawFn: PostDrawHandler = (canvas, data) => {
    const current = tags.current;
    const newTags = cleanUpTags(data.frame, current);
    tags.current = newTags;
  };

  const changeHandler: OnChangeHandler = (value) => {
    tagInput = value;
  };

  const addHandler = () => {
    if (tagInput.trim().length === 0) { return; }
    const color = getNewColor(existingHues);
    tags.current = addTag(tags.current, tagInput, color);
    existingHues.push(color.h);
    tagInput = '';
  }

  const resetConcoction = () => {
    tags.current = {};
  };

  const { Canvas, debug } = useAnimatedCanvas({
    predraw: preDrawFn,
    draw: drawFn,
    postdraw: postDrawFn,
    options: { enableDebug: true },
    renderEnvironmentLayerRenderer: RenderLocation.BottomCenter
  });

  const play = () => {
    debug.renderContinue();
  }

  const pause = () => {
    debug.renderBreak();
  }

  const step = () => {
    debug.renderStep();
  }

  const controls: Array<ControlItem> = [{
    type: "label",
    content: (<TagIcon />),
    for: "tag"
  }, {
    type: "text",
    onChangeHandler: changeHandler,
    name: "tag",
    placeholder: "Enter tag",
    value: () => tagInput
  }, {
    type: "button",
    onClickHandler: addHandler,
    content: (<PlusCircleIcon />),
    title: "Add tag"
  }, {
    type: "button",
    onClickHandler: play,
    content: (<PlayIcon />),
    title: "Play"
  }, {
    type: "button",
    onClickHandler: pause,
    content: (<PauseIcon />),
    title: "Pause"
  }, {
    type: "button",
    onClickHandler: step,
    content: (<ForwardIcon />),
    title: "Play"
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