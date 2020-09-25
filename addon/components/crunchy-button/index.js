import Component from '@glimmer/component';
import { readOnly } from '@ember/object/computed';
import { action } from '@ember/object';

/**
 * @class CrunchyButton
 * @namespace Components
 *
 * ```hbs
 * <CrunchyButton @onClick={{this.myAction}} @label="Click Me" />
 *
 * <CrunchyButton
 *  @task={{this.myTask}}
 *  as |button|>
 *    ...
 * </CrunchyButton>
 * ```
 * @class CrunchyButton
 * @yield {Hash} button
 * @yield {boolean} button.isRunning
 *
 */
export default class CrunchyButtonComponent extends Component {
  _onClick = () => {};

  constructor() {
    super(...arguments);

    if (!this.args.onClick && !this.args.task) {
      // eslint-disable-next-line no-console
      console.warn(new Error('Component crunchy-button created with no @onClick or @task'));
    } else if (this.args.onClick) {
      this._onClick = this.args.onClick;
    }
  }

  @readOnly('task.isRunning') isRunning;

  /**
  * @param {Event} event - the click event
  */
  @action clickAction(event) {
    event.preventDefault();

    if (this.args.task && typeof this.args.task.perform === 'function') {
      this.args.task.perform();
    } else {
      this._onClick();
    }
  }
}
