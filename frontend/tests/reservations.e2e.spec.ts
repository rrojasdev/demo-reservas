import { expect, test } from '@playwright/test';

const email = `e2e-${Date.now()}@example.com`;

test('registers, reserves, lists, and cancels a reservation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '¿Primera vez? Crear cuenta' }).click();
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('password123');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  await expect(page.getByRole('heading', { name: `Hola, ${email}` })).toBeVisible();
  await page.getByLabel('Fecha').fill('2099-01-03');
  await expect(page.getByRole('button', { name: /14:00 Disponible/ })).toBeVisible();
  await page.getByRole('button', { name: /14:00 Disponible/ }).click();

  await page.getByRole('button', { name: 'Mis reservas' }).click();
  await expect(page.getByText('Cancha Laureles')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByText('No tienes reservas futuras.')).toBeVisible();
});
