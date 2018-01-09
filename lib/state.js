/* eslint-disable func-names */

const { merge } = require('lodash');
const { action, observable, observe } = require('mobx');

/**
 * Create a new state.
 */
function createState({ emitter }) {
  const state = observable({
    /**
     * The members.
     */
    members: observable.shallowMap(new Map()),

    /**
     * Add a member.
     */
    addMember: action(function (member) {
      if (member.user.bot) {
        return;
      }

      this.members.set(member.id, {
        id: member.id,
        name: member.displayName,
        avatar: member.user.displayAvatarURL,
        speaking: member.speaking || false,
      });
    }),

    /**
     * Update a member.
     */
    updateMember: action(function (member, properties) {
      if (this.members.has(member.id)) {
        const oldValue = this.members.get(member.id);
        const newValue = merge({}, oldValue, properties);

        this.members.set(member.id, newValue);
      }
    }),

    /**
     * Remove a member.
     */
    deleteMember: action(function (member) {
      this.members.delete(member.id);
    }),
  });

  observe(state.members, (change) => {
    if (change.type === 'add') {
      emitter.emit('memberCreated', change.newValue);
    }

    if (change.type === 'update') {
      emitter.emit('memberUpdated', change.newValue, change.oldValue);
    }

    if (change.type === 'delete') {
      emitter.emit('memberDeleted', change.oldValue);
    }
  });

  return state;
}

module.exports = createState;
