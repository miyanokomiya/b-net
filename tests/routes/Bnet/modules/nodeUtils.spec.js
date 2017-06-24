import {
  generateUuid,
  createNode,
  assignNode,
} from 'routes/Bnet/modules/nodeUtils'

describe('(Redux Module) nodeUtils', () => {
  describe('(Module) generateUuid', () => {
    it('Should be a function.', () => {
      expect(generateUuid).to.be.a('function');
    });

    it('Should return a string.', () => {
      expect(generateUuid()).to.be.a('string');
    });

    it('Should not equal same value.', () => {
      expect(generateUuid()).to.not.equal(generateUuid());
    });
  });

  describe('(Module) createNode', () => {
    it('Should be a function.', () => {
      expect(createNode).to.be.a('function');
    });

    it('Should return a object.', () => {
      expect(createNode()).to.be.a('object');
    });

    it('Should have property "x=0".', () => {
      expect(createNode()).to.have.property('x', 0);
    });
    it('Should have property "y=0".', () => {
      expect(createNode()).to.have.property('y', 0);
    });
    it('Should have property "parentId=null".', () => {
      expect(createNode()).to.have.property('parentId', null);
    });
    it('Should have property "text=empty".', () => {
      expect(createNode()).to.have.property('text', "");
    });
    it('Should have property "id=empty".', () => {
      expect(createNode()).to.have.property('text', "");
    });
    it('Should have property "childIdList=[]".', () => {
      expect(createNode()).to.have.property('childIdList');
      expect(createNode().childIdList).to.be.a('array');
    });
    it('Should have property "shape=empty".', () => {
      expect(createNode()).to.have.property('shape', 0);
    });
  });

  describe('(Module) assignNode', () => {
    it('Should be a function.', () => {
      expect(assignNode).to.be.a('function');
    });

    it('Should return a object.', () => {
      expect(assignNode()).to.be.a('object');
    });

    let obj = {y:10};

    it('第一引数オブジェクトが持たないプロパティが補完される。', () => {
      expect(assignNode(obj):10).to.have.property('x', 0);
    });
    it('第一引数オブジェクトが持つプロパティは変更しない。', () => {
      expect(assignNode(obj)).to.have.property('y', 10);
    });
  });
})
