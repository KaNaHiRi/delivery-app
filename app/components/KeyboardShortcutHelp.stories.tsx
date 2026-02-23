import type { Meta, StoryObj } from '@storybook/react';
import KeyboardShortcutHelp from './KeyboardShortcutHelp';

const meta: Meta<typeof KeyboardShortcutHelp> = {
  title: 'Components/KeyboardShortcutHelp',
  component: KeyboardShortcutHelp,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    isAdmin: { control: 'boolean' },
    onClose: { action: 'onClose' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AdminOpen: Story = {
  args: {
    isOpen: true,
    isAdmin: true,
    onClose: () => {},
  },
};

export const UserOpen: Story = {
  args: {
    isOpen: true,
    isAdmin: false,
    onClose: () => {},
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    isAdmin: true,
    onClose: () => {},
  },
};