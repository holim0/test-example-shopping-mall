import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import data from '@/__mocks__/response/products.json';
import ProductList from '@/pages/home/components/ProductList';
import { formatPrice } from '@/utils/formatter';
import {
  mockUseUserStore,
  mockUseCartStore,
} from '@/utils/test/mockZustandStore';
import render from '@/utils/test/render';

const PRODUCT_PAGE_LIMIT = 5;

const navigateFn = vi.fn();

vi.mock('react-router-dom', async () => {
  const original = await vi.importActual('react-router-dom');
  return {
    ...original,
    useNavigate: () => navigateFn,
    useLocation: () => ({
      state: {
        prevPath: 'prevPath',
      },
    }),
  };
});

it('로딩이 완료된 경우 상품 리스트가 제대로 모두 노출된다', async () => {
  await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);

  const productList = await screen.findAllByTestId('product-card');
  expect(productList).toHaveLength(PRODUCT_PAGE_LIMIT);

  productList.forEach((product, index) => {
    const productCard = within(product);
    const productData = data.products[index];
    expect(productCard.getByText(productData.title)).toBeInTheDocument();

    expect(
      productCard.getByText(productData.category.name),
    ).toBeInTheDocument();

    expect(
      productCard.getByText(formatPrice(productData.price)),
    ).toBeInTheDocument();

    expect(
      productCard.getByRole('button', { name: '장바구니' }),
    ).toBeInTheDocument();

    expect(
      productCard.getByRole('button', { name: '구매' }),
    ).toBeInTheDocument();
  });
});

it('보여줄 상품 리스트가 더 있는 경우 show more 버튼이 노출되며, 버튼을 누르면 상품 리스트를 더 가져온다.', async () => {
  await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);
  const user = userEvent.setup();
  await screen.findAllByTestId('product-card');

  expect(
    screen.getByRole('button', {
      name: 'Show more',
    }),
  ).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Show more' }));

  const newProductList = await screen.findAllByTestId('product-card');
  expect(newProductList).toHaveLength(PRODUCT_PAGE_LIMIT * 2);
});

it('보여줄 상품 리스트가 없는 경우 show more 버튼이 노출되지 않는다.', async () => {
  await render(<ProductList limit={50} />);

  await screen.findAllByTestId('product-card');

  expect(
    screen.queryByRole('button', {
      name: 'Show more',
    }),
  ).not.toBeInTheDocument();
});

describe('로그인 상태일 경우', () => {
  beforeEach(() => {
    mockUseUserStore({ isLogin: true, user: { id: 10 } });
  });

  it('구매 버튼 클릭시 addCartItem 메서드가 호출되며, "/cart" 경로로 navigate 함수가 호출된다.', async () => {
    await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);
    const user = userEvent.setup();
    const addCartItemFn = vi.fn();
    mockUseCartStore({ addCartItem: addCartItemFn });
    await screen.findAllByTestId('product-card');

    const productIndex = 0;
    await user.click(
      screen.getAllByRole('button', { name: '구매' })[productIndex],
    );

    expect(addCartItemFn).toHaveBeenCalledWith(
      data.products[productIndex],
      10,
      1,
    );
    expect(navigateFn).toHaveBeenCalledWith('/cart');
  });

  it('장바구니 버튼 클릭시 "장바구니 추가 완료!" toast를 노출하며, addCartItem 메서드가 호출된다.', async () => {
    await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);
    const user = userEvent.setup();
    const addCartItemFn = vi.fn();
    mockUseCartStore({ addCartItem: addCartItemFn });
    await screen.findAllByTestId('product-card');

    const productIndex = 0;
    await user.click(
      screen.getAllByRole('button', { name: '장바구니' })[productIndex],
    );

    expect(addCartItemFn).toHaveBeenCalledWith(
      data.products[productIndex],
      10,
      1,
    );
    expect(
      screen.getByText(
        `${data.products[productIndex].title} 장바구니 추가 완료!`,
      ),
    ).toBeInTheDocument();
  });
});

describe('로그인이 되어 있지 않은 경우', () => {
  it('구매 버튼 클릭시 "/login" 경로로 navigate 함수가 호출된다.', async () => {
    await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);
    const user = userEvent.setup();
    await screen.findAllByTestId('product-card');

    const productIndex = 0;
    await user.click(
      screen.getAllByRole('button', { name: '구매' })[productIndex],
    );

    expect(navigateFn).toHaveBeenCalledWith('/login');
  });

  it('장바구니 버튼 클릭시 "/login" 경로로 navigate 함수가 호출된다.', async () => {
    await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);
    const user = userEvent.setup();
    await screen.findAllByTestId('product-card');

    const productIndex = 0;
    await user.click(
      screen.getAllByRole('button', { name: '장바구니' })[productIndex],
    );

    expect(navigateFn).toHaveBeenCalledWith('/login');
  });
});

it('상품 클릭시 "/product/:productId" 경로로 navigate 함수가 호출된다.', async () => {
  await render(<ProductList limit={PRODUCT_PAGE_LIMIT} />);
  const user = userEvent.setup();
  await screen.findAllByTestId('product-card');

  const productIndex = 0;
  await user.click(screen.getAllByTestId('product-card')[productIndex]);
  expect(navigateFn).toHaveBeenCalledWith(
    `/product/${data.products[productIndex].id}`,
  );
});
