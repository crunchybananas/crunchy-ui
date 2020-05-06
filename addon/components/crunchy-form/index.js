import Component from '@glimmer/component';
import EmberObject, { set, action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { or } from '@ember/object/computed';
import { task, all, timeout } from 'ember-concurrency';
import { isNone, isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import config from 'diglocal-manage/config/environment';

const TASK_DEBOUNCE = config.environment !== 'test' ? 250 : 0;

/**
 * @class CrunchyForm
 * @namespace Components
 *  
 * ```hbs
 * <CrunchyForm 
 *  @model={{this.myFormModel}}
 *  @formSchema={{this.myFormSchema}}
 *  @onSubmit={{this.submitFormAction}}
 *  @onCancel={{this.cancelFormAction}}
 *  as |form|>
 *    ...
 * </CrunchyForm>
 * ```
 * @class CrunchyForm
 * @yield {Hash} form
 * @yield {boolean} form.didSubmit
 * @yield {EmberObject} form.formErrors
 * @yield {Array<string>} form.formMessages
 * @yield {Action} form.validateField
 * @yield {Action} form.validateForm
 * @yield {Action} form.submitForm
 * @yield {Action} form.cancelForm
 * 
 */
export default class CrunchyFormComponent extends Component {
  _onSubmit = () => {};
  _onCancel = () => {};
  _debounceSubmit = false;
  
  @tracked didSubmit = false;
  @tracked formErrors = EmberObject.create();
  @tracked formMessages = [];

  constructor() {
    super(...arguments);

    assert('<CrunchyForm> requires a `@model` object', this.args.model && typeof this.args.model === 'object');

    isPresent(this.args.onSubmit) ?
      this._onSubmit = this.args.onSubmit :
      // eslint-disable-next-line no-console
      console.warn(new Error('Component <CrunchyForm> created with no `@onSubmit` action'));

    isPresent(this.args.onCancel) ?
      this._onCancel = this.args.onCancel :
      // eslint-disable-next-line no-console
      console.warn(new Error('Component <CrunchyForm> created with no `@onCancel` action'));

    this._debounceSubmit = isPresent(this.args.debounceSubmit) ? this.args.debounceSubmit : this._debounceSubmit;
  }

  @task(function*() {
    this.didSubmit = true;

    let validated = yield this.validateForm();

    // If ValidationError is returned, abort submit
    if (validated.name === 'ValidationError') {
      return;
    }

    // We might want to debounce submit to provide better visual feedback to the user.
    // If true, ensure that the submit task will be running for at least 250ms
    // (but only if the onSubmit action is completed in less time)
    return yield all([
      timeout(this._debounceSubmit ? TASK_DEBOUNCE : 0),
      this._onSubmit(validated)
    ]);
  })
  submitTask;

  /**
   * Validate a single field on the model against the formSchema
   * @param {string} field
   * @return {Promise<any, ValidationError>} - returns the valid value or a yup ValidationError
  */
  @action
  async validateField(field) {
    let formSchema = this.args.formSchema;
    let isUndefinedSchema = isNone(formSchema) || Object.prototype.hasOwnProperty.call(formSchema['fields'], field);
    // If no schema is defined for the given field, assume the field is valid
    if (isUndefinedSchema) {
      return Promise.resolve(this.args.model[field]);
    }

    try {
      let validated = await formSchema.validateAt(field, this.args.model);
      // The field is valid, so remove any previous error entries
      this.formErrors[field] = null;
      return validated;
    } catch(validationError) {
      // Update formErrors hash with the returned ValidationError
      this.formErrors[field] = validationError;
      return validationError;
    }
  }

  /**
   * Validate all fields in the model against the formSchema
   * @return {Promise<Object, ValidationError>} - returns the valid form model or a yup ValidationError
  */
  @action
  async validateForm() {
    let formSchema = this.args.formSchema;
    // If no formSchema is defined, assume model is valid
    if (isNone(formSchema)) {
      return Promise.resolve(this.args.model);
    }

    try {
      return await this.formSchema.validate(this.args.model, { abortEarly: false });
    } catch(validationError) {
      // Iterate over the ValidationError's array of errors and return a hash
      // with keys named for each invalid field through which we can access the
      // respective field's ValidationError.
      //
      this.formErrors = validationError.inner.reduce((errors, error) => {
        errors[error.path] = error;
        return errors;
      }, {});

      // Set formMessages to an array of simple error message strings
      // e.g. [ 'Name cannot be blank', 'Password must contain a number' ]
      this.formMessages = validationError.errors;
      return validationError;
    }
  }

  @task(function*() {
    this.didSubmit = false;
    this.formErrors = EmberObject.create();
    this.formMessages = [];

    return yield this._onCancel();
  })
  cancelTask;

  @action
  async cancelForm() {
    await this.cancelTask.perform();
  }

  /**
  * @param {Event} event - the form submit event
  */
  @action
  async submitForm(event) {
    event.preventDefault();
    return await this.submitTask.perform();
  }
}
