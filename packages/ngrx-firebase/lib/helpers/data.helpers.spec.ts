import { NgrxDataHelpers } from './data.helpers';

const item1 = { id: 'someId1', some: 'value1' };
const item2 = { id: 'someId2', some: 'value2' };
const updatedItem2 = { id: 'someId2', some: 'Updatedvalue2' };
const item3 = { id: 'someId3', some: 'value3' };
const item4 = { id: 'someId4', some: 'value4' };
const item5 = { id: 'someId5', some: 'value5' };
const updatedItem4 = { id: 'someId4', some: 'Updatedvalue4' };

const items = [item1, item2, item4];
const removedItem = [item1, item4];
const removedItems = [item1];
const addedItem3 = [item1, item2, item4, item3];
const modifiedItem2 = [item1, updatedItem2, item4];
const modifiedItems = [item1, updatedItem2, updatedItem4];

describe('Data helpers', () => {
  describe('upsertOne', () => {
    describe('when no array is provided', () => {
      it('should default to empty array then upsert properly', () => {
        expect(NgrxDataHelpers.upsertOne(undefined, updatedItem2, 'id')).toEqual([updatedItem2]);
      });
    });

    describe('when item is already in array according to comparison key', () => {
      it('should replace the item in position', () => {
        expect(NgrxDataHelpers.upsertOne(items, updatedItem2, 'id')).toEqual(modifiedItem2);
      });
    });

    describe('when item is not already in array according to comparison key', () => {
      it('should add the item at the end of array', () => {
        expect(NgrxDataHelpers.upsertOne(items, item3, 'id')).toEqual(addedItem3);
      });
    });
  });

  describe('upsertMany', () => {
    describe('when no array is provided', () => {
      it('should default to empty array then upsert properly', () => {
        expect(NgrxDataHelpers.upsertMany(undefined, [updatedItem2, item3], 'id')).toEqual([updatedItem2, item3]);
      });
    });

    describe('when containing item that is already in array according to comparison key', () => {
      it('should replace the item in position', () => {
        expect(NgrxDataHelpers.upsertMany(items, [updatedItem2, item3], 'id')).toEqual([...modifiedItem2, item3]);
      });
    });

    describe('when containing no item that is already in array according to comparison key', () => {
      it('should add the item at the end of array', () => {
        expect(NgrxDataHelpers.upsertMany(items, [item3], 'id')).toEqual(addedItem3);
        expect(NgrxDataHelpers.upsertMany(items, [item3, item5], 'id')).toEqual([...addedItem3, item5]);
        expect(NgrxDataHelpers.upsertMany(items, [updatedItem2, updatedItem4], 'id')).toEqual(modifiedItems);
      });
    });
  });

  describe('removeOne', () => {
    describe('when no array is provided', () => {
      it('should default to empty array then remove item properly', () => {
        expect(NgrxDataHelpers.removeOne(undefined, item2, 'id')).toEqual([]);
      });
    });

    describe('when item is in array', () => {
      it('should remove the item in position', () => {
        expect(NgrxDataHelpers.removeOne(items, item2, 'id')).toEqual(removedItem);
      });
    });
  });

  describe('removeMany', () => {
    describe('when no array is provided', () => {
      it('should default to empty array then remove item properly', () => {
        expect(NgrxDataHelpers.removeMany(undefined, [item2, item4], 'id')).toEqual([]);
      });
    });

    describe('when item are in the array', () => {
      it('should remove items from the array', () => {
        expect(NgrxDataHelpers.removeMany(items, [item2, item4], 'id')).toEqual(removedItems);
      });
    });
  });
});
