<template>
  <div id="app">
    <div class="VoiceChannel">
      <transition-group name="list" tag="div" class="VoiceChannel__users">
        <div class="User" v-for="member in sortedMembers" v-bind:key="member.id" v-bind:class="{ 'User--speaking': member.speaking }">
          <div class="User__avatarContainer">
            <div class="User__avatar" v-bind:style="{ backgroundImage: `url(${member.avatar})` }" />
          </div>
          <div class="User__name">
            {{ member.name }}
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
  import { sortBy } from 'lodash';
  import io from 'socket.io-client';

  export default {
    data() {
      return {
        members: {},
      };
    },
    created() {
      const socket = io.connect();

      socket.on('membersReceived', (members) => {
        members.forEach((member) => {
          this.$set(this.members, member.id, member);
        });
      });

      socket.on('memberCreated', (member) => {
        this.$set(this.members, member.id, member);
      });

      socket.on('memberUpdated', (member) => {
        this.$set(this.members, member.id, member);
      });

      socket.on('memberDeleted', (member) => {
        this.$delete(this.members, member.id);
      });
    },
    computed: {
      sortedMembers() {
        return sortBy(this.members, 'name');
      },
    },
  };
</script>

<style lang="scss">
  @import "settings";
  @import "foundation";

  @include foundation-global-styles;
  @include foundation-typography;

  html,
  body {
    height: 100%;
  }

  body {
    align-items: center;
    display: flex;
    justify-content: center;
    min-height: 100%;
  }

  .list-enter,
  .list-leave-to, {
    opacity: 0;
    transform: scale(.75);
  }

  .list-leave-active {
    position: absolute;
  }

  .VoiceChannel {

    &__users {
      align-items: center;
      display: flex;
    }
  }

  .User {
    align-items: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin: 2rem;
    text-align: center;
    transition: all .5s ease;
    width: 240px;

    &__avatarContainer {
      border: 2px solid transparent;
      border-radius: 500px;
      height: 180px;
      overflow: hidden;
      transition: all .5s ease;
      width: 180px;
    }

    &__avatar {
      background-color: $white;
      background-position: center;
      background-size: cover;
      height: 100%;
    }

    &__name {
      font-size: 4rem;
      font-weight: 900;
      letter-spacing: 1px;
      line-height: 1;
      margin-top: 1rem;
      opacity: .5;
      transition: all .5s ease;
    }

    &--speaking {

      .User {

        &__avatarContainer {
          box-shadow: 0 0 0 8px $primary-color;
        }

        &__name {
          opacity: 1;
        }
      }
    }
  }
</style>
