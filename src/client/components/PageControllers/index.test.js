import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('PageControllers component', () => {
  describe('\'next\' button', () => {
    it('is present when there are pages to the right of the current page', () => {
    });
  });

  describe('\'previous\' button', () => {
    it('is present when there are pages to the left of the current page', () => {
    });
  });

  describe('current page text input', () => {
    it('displays the current page', () => {
    });

    it('calls the jumpToPage function when changed', () => {
    });
  });

  describe('page count label', () => {
    it('displays the total page count', () => {
    });
  });
});
