import app from './src/app.js';
import { initDb, query } from './src/db/index.js';
import http from 'http';

async function runTests() {
  console.log('=== Starting Comprehensive Backend Verification Tests ===\n');
  
  // 1. Database migration test
  console.log('Test 1: Database Migration & Schema Verification...');
  await initDb();
  const tableInfo = await query('PRAGMA table_info(meals)');
  const hasDateCol = tableInfo.rows.some(r => r.name === 'date');
  if (!hasDateCol) throw new Error('meals table missing date column');
  console.log('✓ meals table has date column\n');

  // Start temporary server on random port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`Test server running at ${baseUrl}`);

  async function api(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: options.noAuth ? undefined : 'Bearer demo-token',
        ...options.headers
      },
      ...options
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  }

  // 2. Authentication behavior test
  console.log('Test 2: Authentication Behavior...');
  const unauthRes = await api('/tasks', { noAuth: true });
  if (unauthRes.status !== 401) throw new Error(`Expected 401 unauthenticated, got ${unauthRes.status}`);
  console.log('✓ Unauthenticated request rejected with 401');

  const authRes = await api('/tasks');
  if (authRes.status !== 200) throw new Error(`Expected 200 with demo token, got ${authRes.status}`);
  console.log('✓ Demo token accepted with 200 OK\n');

  // 3. Task CRUD Test
  console.log('Test 3: Tasks CRUD and Empty State Handling...');
  const testTaskId = `test-task-${Date.now()}`;
  const createTaskRes = await api('/tasks', {
    method: 'POST',
    body: JSON.stringify({
      id: testTaskId,
      title: 'Verification Test Task',
      category: 'School',
      priority: 'high',
      due_date: '2026-09-15T10:00'
    })
  });
  if (createTaskRes.status !== 201) throw new Error(`Failed to create task: ${JSON.stringify(createTaskRes.data)}`);
  console.log('✓ Task created successfully');

  const getTasksRes = await api('/tasks');
  const foundTask = getTasksRes.data.find(t => t.id === testTaskId);
  if (!foundTask) throw new Error('Created task not found in GET /api/tasks');
  console.log('✓ Created task returned in GET /api/tasks');

  const toggleRes = await api(`/tasks/${testTaskId}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ completed: true })
  });
  if (!toggleRes.ok) throw new Error('Failed to toggle task');
  console.log('✓ Task toggle complete');

  const updateRes = await api(`/tasks/${testTaskId}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: 'Updated Test Task Title',
      category: 'Exams',
      priority: 'medium',
      due_date: '2026-09-16T12:00',
      completed: true
    })
  });
  if (!updateRes.ok) throw new Error('Failed to update task');
  console.log('✓ Task updated');

  const deleteTaskRes = await api(`/tasks/${testTaskId}`, { method: 'DELETE' });
  if (!deleteTaskRes.ok) throw new Error('Failed to delete task');
  console.log('✓ Task deleted successfully\n');

  // 4. Meals Date-Based API Test
  console.log('Test 4: Meals Date-Based API & Rolling Calendar Persistence...');
  const todayKey = '2026-09-11';
  const tomorrowKey = '2026-09-12';

  // Save single date meal
  const putMealRes = await api('/meals', {
    method: 'PUT',
    body: JSON.stringify({
      date: todayKey,
      breakfast: 'Matcha Oatmeal Bowl',
      lunch: 'Roasted Veggie Quinoa',
      dinner: 'Creamy Mushroom Pasta',
      snack: 'Spiced Apple & Cashews'
    })
  });
  if (!putMealRes.ok) throw new Error(`Failed to PUT meal: ${JSON.stringify(putMealRes.data)}`);
  console.log('✓ Single date meal saved');

  // Save dictionary date meal
  const putBatchMealRes = await api('/meals', {
    method: 'PUT',
    body: JSON.stringify({
      [tomorrowKey]: {
        breakfast: 'Blueberry Flapjacks',
        lunch: 'Lentil Soup',
        dinner: 'Tofu Fried Rice',
        snack: 'Orange slices'
      }
    })
  });
  if (!putBatchMealRes.ok) throw new Error('Failed to batch PUT meals');
  console.log('✓ Batch date meals saved');

  // Fetch all meals
  const getMealsRes = await api('/meals');
  if (!getMealsRes.data[todayKey] || getMealsRes.data[todayKey].dinner !== 'Creamy Mushroom Pasta') {
    throw new Error(`Today meal mismatch: ${JSON.stringify(getMealsRes.data[todayKey])}`);
  }
  if (!getMealsRes.data[tomorrowKey] || getMealsRes.data[tomorrowKey].dinner !== 'Tofu Fried Rice') {
    throw new Error(`Tomorrow meal mismatch: ${JSON.stringify(getMealsRes.data[tomorrowKey])}`);
  }
  console.log('✓ Meals retrieved and verified by date');

  // Date range filter
  const filterMealsRes = await api(`/meals?startDate=${todayKey}&endDate=${todayKey}`);
  if (!filterMealsRes.data[todayKey] || filterMealsRes.data[tomorrowKey]) {
    throw new Error('Meal date range filtering failed');
  }
  console.log('✓ Meals date range filtering verified');

  // Clean up tomorrow meal
  const deleteMealRes = await api(`/meals/${tomorrowKey}`, { method: 'DELETE' });
  if (!deleteMealRes.ok) throw new Error('Failed to delete meal');
  console.log('✓ Date meal deleted successfully\n');

  // 5. Dashboard Aggregation Test
  console.log('Test 5: Dashboard Aggregation for Today Meal...');
  const dashRes = await api('/dashboard');
  if (!dashRes.ok) throw new Error(`Failed to fetch dashboard: ${JSON.stringify(dashRes.data)}`);
  console.log(`✓ Dashboard dinner today: "${dashRes.data.meals.dinner}"`);
  if (dashRes.data.meals.dinner !== 'Creamy Mushroom Pasta') {
    throw new Error(`Expected dashboard dinner to be "Creamy Mushroom Pasta", got "${dashRes.data.meals.dinner}"`);
  }
  console.log('✓ Dashboard reflects exact date-based meal planned for today!\n');

  // 6. Closet & Outfits Test
  console.log('Test 6: Closet & Outfits persistence...');
  const outfitId = `outfit-${Date.now()}`;
  const postOutfitRes = await api('/outfits', {
    method: 'POST',
    body: JSON.stringify({
      id: outfitId,
      name: 'Autumn Campus Outfit',
      occasion: 'Classes',
      items: ['Beige Sweater', 'Plaid Pants', 'Leather Boots']
    })
  });
  if (!postOutfitRes.ok) throw new Error('Failed to create outfit');
  if (!Array.isArray(postOutfitRes.data.items)) throw new Error('Outfit items must be returned as array');

  const getOutfitsRes = await api('/outfits');
  const createdOutfit = getOutfitsRes.data.find(o => o.id === outfitId);
  if (!createdOutfit || !Array.isArray(createdOutfit.items) || createdOutfit.items.length !== 3) {
    throw new Error(`Outfit retrieval failed: ${JSON.stringify(createdOutfit)}`);
  }
  console.log('✓ Outfit items correctly parsed as array');

  const patchTodayRes = await api(`/outfits/${outfitId}/today`, {
    method: 'PATCH',
    body: JSON.stringify({ is_today: true })
  });
  if (!patchTodayRes.ok) throw new Error('Failed to patch outfit today');
  console.log('✓ Outfit marked as today');

  const deleteOutfitRes = await api(`/outfits/${outfitId}`, { method: 'DELETE' });
  if (!deleteOutfitRes.ok) throw new Error('Failed to delete outfit');
  console.log('✓ Outfit deleted successfully\n');

  // 7. Budget & Expenses Test
  console.log('Test 7: Budget Limits & Expenses...');
  const putBudgetRes = await api('/budget', {
    method: 'PUT',
    body: JSON.stringify({ monthly: 600, weekly: 150, daily: 25, snackWeekly: 35 })
  });
  if (!putBudgetRes.ok) throw new Error('Failed to update budget limits');
  const getBudgetRes = await api('/budget');
  if (getBudgetRes.data.monthly !== 600) throw new Error('Budget limit update mismatch');
  console.log('✓ Budget limits persisted');

  const expenseId = `exp-${Date.now()}`;
  const postExpRes = await api('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      id: expenseId,
      amount: 4.50,
      category: 'Snacks & Coffee',
      note: 'Espresso Tonic',
      date: '2026-09-11'
    })
  });
  if (!postExpRes.ok) throw new Error('Failed to record expense');
  const deleteExpRes = await api(`/expenses/${expenseId}`, { method: 'DELETE' });
  if (!deleteExpRes.ok) throw new Error('Failed to delete expense');
  console.log('✓ Expense logged and deleted\n');

  // 8. Sleep Records Test
  console.log('Test 8: Sleep Logs...');
  const sleepId = `sleep-${Date.now()}`;
  const postSleepRes = await api('/sleep', {
    method: 'POST',
    body: JSON.stringify({
      id: sleepId,
      date: '2026-09-11',
      bedtime: '23:30',
      wake_time: '07:30',
      duration_minutes: 480,
      quality: 5,
      notes: 'Deep restful night'
    })
  });
  if (!postSleepRes.ok) throw new Error('Failed to post sleep log');
  const deleteSleepRes = await api(`/sleep/${sleepId}`, { method: 'DELETE' });
  if (!deleteSleepRes.ok) throw new Error('Failed to delete sleep log');
  console.log('✓ Sleep log recorded and deleted\n');

  // 9. Home Tasks Test
  console.log('Test 9: Home / Room Tasks...');
  const choreId = `chore-${Date.now()}`;
  const postChoreRes = await api('/home-tasks', {
    method: 'POST',
    body: JSON.stringify({
      id: choreId,
      title: 'Disinfect keyboard & mouse',
      area: 'Study Desk',
      frequency: 'Weekly'
    })
  });
  if (!postChoreRes.ok) throw new Error('Failed to create chore');
  const toggleChoreRes = await api(`/home-tasks/${choreId}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ is_completed: true })
  });
  if (!toggleChoreRes.ok) throw new Error('Failed to toggle chore');
  const deleteChoreRes = await api(`/home-tasks/${choreId}`, { method: 'DELETE' });
  if (!deleteChoreRes.ok) throw new Error('Failed to delete chore');
  console.log('✓ Home chore created, toggled, and deleted\n');

  // Close server
  await new Promise(resolve => server.close(resolve));
  console.log('====================================================');
  console.log('🎉 ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\n❌ Verification test failed:', err);
  process.exit(1);
});
