import Adapt from 'core/js/adapt';
import fileInputView from './fileInputView';
import fileInputModel from './fileInputModel';

export default Adapt.register('fileinput', {
  view: fileInputView,
  model: fileInputModel
});
