import { screen, within, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ProductInfoTable from '@/pages/cart/components/ProductInfoTable';
import {
  mockUseCartStore,
  mockUseUserStore,
} from '@/utils/test/mockZustandStore';

beforeEach(() => {
  mockUseUserStore({ user: { id: 10 } });
  mockUseCartStore({
    cart: {
      6: {
        id: 6,
        title: 'Handmade Cotton Fish',
        price: 809,
        description:
          'The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality',
        images: [
          'https://user-images.githubusercontent.com/35371660/230712070-afa23da8-1bda-4cc4-9a59-50a263ee629f.png',
          'https://user-images.githubusercontent.com/35371660/230711992-01a1a621-cb3d-44a7-b499-20e8d0e1a4bc.png',
          'https://user-images.githubusercontent.com/35371660/230712056-2c468ef4-45c9-4bad-b379-a9a19d9b79a9.png',
        ],
        count: 3,
      },
      7: {
        id: 7,
        title: 'Awesome Concrete Shirt',
        price: 442,
        description:
          'The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J',
        images: [
          'https://user-images.githubusercontent.com/35371660/230762100-b119d836-3c5b-4980-9846-b7d32ea4a08f.png',
          'https://user-images.githubusercontent.com/35371660/230762118-46d965ab-7ea8-4e8a-9c0f-3ed90f96e1cd.png',
          'https://user-images.githubusercontent.com/35371660/230762139-002578da-092d-4f34-8cae-2cf3b0dfabe9.png',
        ],
        count: 4,
      },
    },
  });
});

it('장바구니에 포함된 아이템들의 이름, 수량, 합계가 제대로 노출된다', async () => {
  render(<ProductInfoTable />);

  const [firstRow, secondRow] = screen.getAllByRole('row');

  expect(
    within(firstRow).getByText('Handmade Cotton Fish'),
  ).toBeInTheDocument();
  expect(within(firstRow).getByRole('textbox')).toHaveValue('3');
  expect(within(firstRow).getByText('$2,427.00')).toBeInTheDocument();

  expect(
    within(secondRow).getByText('Awesome Concrete Shirt'),
  ).toBeInTheDocument();
  expect(within(secondRow).getByRole('textbox')).toHaveValue('4');
  expect(within(secondRow).getByText('$1,768.00')).toBeInTheDocument();
});

it('특정 아이템의 수량이 변경되었을 때 값이 재계산되어 올바르게 업데이트 된다', async () => {
  render(<ProductInfoTable />);
  const user = userEvent.setup();
  const [firstRow] = screen.getAllByRole('row');

  const firstRowCountInput = within(firstRow).getByRole('textbox');

  // 기존 값을 전부 선택
  await user.clear(firstRowCountInput);
  // 새로운 값 입력
  await user.type(firstRowCountInput, '10');

  expect(within(firstRow).getByRole('textbox')).toHaveValue('10');
  expect(within(firstRow).getByText('$8,090.00')).toBeInTheDocument();
});

it('특정 아이템의 수량이 1000개로 변경될 경우 "최대 999개 까지 가능합니다!"라고 경고 문구가 노출된다', async () => {
  const alertSpy = vi.fn();

  vi.stubGlobal('alert', alertSpy);

  render(<ProductInfoTable />);
  const user = userEvent.setup();
  const [firstRow] = screen.getAllByRole('row');

  const firstRowCountInput = within(firstRow).getByRole('textbox');

  await user.clear(firstRowCountInput);
  await user.type(firstRowCountInput, '1000');

  expect(alertSpy).toHaveBeenCalledWith('최대 999개 까지 가능합니다!');
});

it('특정 아이템의 삭제 버튼을 클릭할 경우 해당 아이템이 사라진다', async () => {
  render(<ProductInfoTable />);
  const user = userEvent.setup();
  const [firstRow] = screen.getAllByRole('row');

  const deleteButton = within(firstRow).getByRole('button');

  await user.click(deleteButton);

  expect(screen.queryByText('Handmade Cotton Fish')).not.toBeInTheDocument();
});
