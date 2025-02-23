import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ProductFilter from '@/pages/home/components/ProductFilter';
import { mockUseFilterStore } from '@/utils/test/mockZustandStore';
import render from '@/utils/test/render';

const setMinPriceFn = vi.fn();
const setMaxPriceFn = vi.fn();
const setTitleFn = vi.fn();

beforeEach(() => {
  mockUseFilterStore({
    setMinPrice: setMinPriceFn,
    setMaxPrice: setMaxPriceFn,
    setTitle: setTitleFn,
  });
});

it('카테고리 목록을 가져온 후 카테고리 필드의 정보들이 올바르게 렌더링된다.', async () => {
  await render(<ProductFilter />);

  expect(await screen.findByLabelText('category1')).toBeInTheDocument();
  expect(await screen.findByLabelText('category2')).toBeInTheDocument();
  expect(await screen.findByLabelText('category3')).toBeInTheDocument();
  expect(await screen.findByLabelText('All')).toBeInTheDocument();
});

it('상품명을 수정하는 경우 setTitle 액션이 호출된다.', async () => {
  await render(<ProductFilter />);
  const user = userEvent.setup();
  const searchInput = screen.getByRole('textbox', { name: '상품명' });
  await user.type(searchInput, 'test');

  expect(setTitleFn).toHaveBeenCalledWith('test');
});

it('카테고리를 클릭 할 경우의 클릭한 카테고리가 체크된다.', async () => {
  await render(<ProductFilter />);
  const user = userEvent.setup();
  const category1 = await screen.findByLabelText('category1');
  await user.click(category1);

  expect(category1).toBeChecked();
});

it('최소 가격 또는 최대 가격을 수정하면 setMinPrice과 setMaxPrice 액션이 호출된다.', async () => {
  await render(<ProductFilter />);
  const user = userEvent.setup();
  const minPriceInput = screen.getByPlaceholderText('최소 금액');
  await user.type(minPriceInput, '10000');

  expect(setMinPriceFn).toHaveBeenCalledWith('10000');

  const maxPriceInput = screen.getByPlaceholderText('최대 금액');
  await user.type(maxPriceInput, '20000');

  expect(setMaxPriceFn).toHaveBeenCalledWith('20000');
});
