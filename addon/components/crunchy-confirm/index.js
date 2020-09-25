import Component from '@ember/component';
import { or } from '@ember/object/computed';
import { setProperties, action } from '@ember/object';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

/*
  Confirm action alert:
    <CrunchyConfirm
      @onConfirm={{this.confirmAction}}
      @onCancel={{this.cancelAction}}
    >
    </CrunchyConfirm>
*/

export default class CrunchyConfirm extends Component {
  @tracked show = false;
  @tracked didConfirm = false;
  @tracked allowClose = true;
  @tracked showCancel = true;
  @tracked disabled = false;

  confirmText = 'Confirm';
  cancelText = 'Cancel';

  @or('disabled', 'confirmTask.isRunning') isDisabled;

  onConfirm() {}
  onCancel() {}

  @task(function*() {
    this.didConfirm = true;
    yield this.onConfirm();
  })
  confirmTask;

  @action confirm() {
    this.confirmTask.perform();
  }

  @action cancel() {
    this.onCancel();
    setProperties(this, {
      show: false,
      didConfirm: false
    });
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.didConfirm = false;
  }
}
