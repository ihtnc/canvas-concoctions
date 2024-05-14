import { Mock, afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import ControlPanel, { ControlItem, OnClickHandler, OnInputHandler } from './index';
import { act, render } from '@testing-library/react';
import { useState } from 'react';

vi.mock('react', () => ({
  ...vi.importActual('react'),
  useState: vi.fn()
}));

describe('ControlPanel component', () => {
  let setLastRenderDate: Mock;
  let useStateMock: Mock;
  let onClickHandler: OnClickHandler;
  let onInputHandler: OnInputHandler;

  beforeEach(() => {
    setLastRenderDate = vi.fn();

    useStateMock = useState as Mock;
    useStateMock.mockReturnValue([new Date(), setLastRenderDate]);

    onClickHandler = vi.fn();
    onInputHandler = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when providing a ButtonControlItem', () => {
    let ctrl: ControlItem;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2021-01-01T00:00:00.000Z'));

      ctrl = {
        type: 'button',
        content: <span>this is a button</span>,
        onClickHandler
      };
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should render a button', () => {
      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should render a button with optional string properties', () => {
      ctrl = {
        type: 'button',
        content: <span>this is a button</span>,
        onClickHandler,
        name: 'buttonName',
        disabled: true,
        title: 'buttonTitle',
        className: 'buttonClass'
      };

      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should call the function to get the disabled value if function is supplied', () => {
      const disabled = false;
      const fn = vi.fn(() => disabled);

      ctrl = {
        type: 'button',
        content: <span>this is a button</span>,
        onClickHandler,
        disabled: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const button = getByRole('button') as HTMLButtonElement;
      expect(button.disabled).toBe(disabled);
    });

    test('should call the function to get the title value if function is supplied', () => {
      const title = 'buttonTitle';
      const fn = vi.fn(() => title);

      ctrl = {
        type: 'button',
        content: <span>this is a button</span>,
        onClickHandler,
        title: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const button = getByRole('button');
      expect(button.title).toBe(title);
    });

    test('should call the function to get the className value if function is supplied', () => {
      const className = 'buttonClass';
      const expected = `flex ${className}`;
      const fn = vi.fn(() => className);

      ctrl = {
        type: 'button',
        content: <span>this is a button</span>,
        onClickHandler,
        className: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const button = getByRole('button');
      expect(button.className).toBe(expected);
    });

    test('should not render the button if hidden is true', () => {
      ctrl = {
        type: 'button',
        content: <span>this is a button</span>,
        onClickHandler,
        hidden: true
      };

      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should force a rerender when button is clicked', () => {
      const now = new Date('2022-01-01T00:00:00.000Z');
      vi.setSystemTime(now);

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);
      act(() => {
        getByRole('button').click();
      });

      expect(useState).toHaveBeenCalled();
      expect(setLastRenderDate).toHaveBeenCalledWith(now);
    });

    test('should call onClickHandler when button is clicked', () => {
      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      act(() => {
        getByRole('button').click();
      });

      expect(onClickHandler).toHaveBeenCalled();
    });
  });

  describe('when providing a TextInputControlItem', () => {
    let ctrl: ControlItem;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2021-01-01T00:00:00.000Z'));

      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName'
      };
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test('should render a text input', () => {
      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should render a text input with optional string properties', () => {
      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName',
        placeholder: 'inputPlaceholder',
        value: 'initialValue',
        disabled: true,
        title: 'inputTitle',
        className: 'inputClass'
      };

      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should call the function to get the placeholder value if function is supplied', () => {
      const placeholder = 'inputPlaceholder';
      const fn = vi.fn(() => placeholder);

      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName',
        placeholder: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.placeholder).toBe(placeholder);
    });

    test('should call the function to get the input value if function is supplied', () => {
      const value = 'inputValue';
      const fn = vi.fn(() => value);

      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName',
        value: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(value);
    });

    test('should call the function to get the disabled value if function is supplied', () => {
      const disabled = false;
      const fn = vi.fn(() => disabled);

      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName',
        disabled: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const input = getByRole('textbox') as HTMLInputElement;
      expect(input.disabled).toBe(disabled);
    });

    test('should call the function to get the title value if function is supplied', () => {
      const title = 'inputTitle';
      const fn = vi.fn(() => title);

      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName',
        title: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const input = getByRole('textbox');
      expect(input.title).toBe(title);
    });

    test('should call the function to get the className value if function is supplied', () => {
      const className = 'inputClass';
      const expected = `flex ${className}`;
      const fn = vi.fn(() => className);

      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName',
        className: fn
      };

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const input = getByRole('textbox');
      expect(input.className).toBe(expected);
    });

    test('should not render the input if hidden is true', () => {
      ctrl = {
        type: 'text',
        onInputHandler,
        name: 'inputName',
        hidden: true
      };

      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should force a rerender when input value changes', () => {
      const now = new Date('2022-01-01T00:00:00.000Z');
      vi.setSystemTime(now);

      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);
      const input = getByRole('textbox') as HTMLInputElement;

      act(() => {
        input.value = 'newValue';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(useState).toHaveBeenCalled();
      expect(setLastRenderDate).toHaveBeenCalledWith(now);
    });

    test('should call onInputHandler when input value changes', () => {
      const { getByRole } = render(<ControlPanel controls={[ctrl]} />);
      const input = getByRole('textbox') as HTMLInputElement;

      act(() => {
        input.value = 'newValue';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });

      expect(onInputHandler).toHaveBeenCalled();
    });
  });

  describe('when providing a LabelControlItem', () => {
    let ctrl: ControlItem;

    beforeEach(() => {
      ctrl = {
        type: 'label',
        content: <>this is a label</>
      };
    });

    test('should render a label', () => {
      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should render a label with optional string properties', () => {
      ctrl = {
        type: 'label',
        content: <>this is a label</>,
        for: 'labelFor',
        disabled: true,
        title: 'labelTitle',
        className: 'labelClass'
      };

      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });

    test('should call the function to get the title value if function is supplied', () => {
      const title = 'labelTitle';
      const fn = vi.fn(() => title);
      const content = 'this is a label';

      ctrl = {
        type: 'label',
        content: <>{content}</>,
        title: fn,
        for: 'labelFor'
      };

      const { getByText } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const label = getByText(content, { exact: false });
      expect(label.title).toBe(title);
    });

    test('should call the function to get the className value if function is supplied', () => {
      const className = 'labelClass';
      const expected = `flex ${className}`;
      const fn = vi.fn(() => className);
      const content = 'this is a label';

      ctrl = {
        type: 'label',
        content: <>{content}</>,
        className: fn
      };

      const { getByText } = render(<ControlPanel controls={[ctrl]} />);

      expect(fn).toHaveBeenCalled();

      const label = getByText(content, { exact: false });
      expect(label.className).toBe(expected);
    });

    test('should not render the label if hidden is true', () => {
      ctrl = {
        type: 'label',
        content: <span>this is a label</span>,
        hidden: true
      };

      const { container } = render(<ControlPanel controls={[ctrl]} />);

      expect(container).toMatchSnapshot();
    });
  });
});