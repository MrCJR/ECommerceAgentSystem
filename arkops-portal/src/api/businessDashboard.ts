import { mockDelay } from './client';
import type { BusinessMetrics } from '../types/domain';

export const businessDashboardApi = {
  getMetrics: (): Promise<BusinessMetrics> =>
    mockDelay({
      gmv: { today: 28640, yesterday: 27350, lastWeekSameDay: 24900 },
      orders: { today: 412, yesterday: 388, lastWeekSameDay: 356 },
      aov: 69.5,
      storeCount: { online: 3, total: 3 },
      gmvTrend: [
        { date: '6/9', gmv: 23500, orders: 342 },
        { date: '6/10', gmv: 24900, orders: 356 },
        { date: '6/11', gmv: 26100, orders: 370 },
        { date: '6/12', gmv: 25800, orders: 365 },
        { date: '6/13', gmv: 27900, orders: 398 },
        { date: '6/14', gmv: 27350, orders: 388 },
        { date: '6/15', gmv: 28640, orders: 412 }
      ],
      storeGmvRank: [
        { storeName: 'TikTok Shop 美国旗舰店', gmv: 15620, platform: 'TikTok Shop' },
        { storeName: 'Amazon 户外用品店', gmv: 8740, platform: 'Amazon' },
        { storeName: 'Shopify 独立站', gmv: 4280, platform: 'Shopify' }
      ],
      adMetrics: {
        todaySpend: 3840,
        roas: 7.46,
        cpm: 12.4,
        cpc: 0.82,
        ctr: 3.2,
        cvr: 4.8,
        budgetLimit: 5000,
        targetRoas: 5.0,
        trend: [
          { date: '6/9', spend: 3200, gmv: 21120 },
          { date: '6/10', spend: 3580, gmv: 24900 },
          { date: '6/11', spend: 3700, gmv: 27520 },
          { date: '6/12', spend: 3450, gmv: 25360 },
          { date: '6/13', spend: 3900, gmv: 29250 },
          { date: '6/14', spend: 3750, gmv: 27350 },
          { date: '6/15', spend: 3840, gmv: 28640 }
        ],
        lowPerformingPlans: [
          { name: '广告计划 C-102', spend: 612, roi: 1.42 },
          { name: '广告计划 B-045', spend: 428, roi: 2.18 },
          { name: '广告计划 A-017', spend: 356, roi: 2.85 }
        ]
      },
      afterSales: {
        returnRate: 3.2,
        returnAmount: 916,
        negativeReviews: 5,
        respondedReviews: 3,
        reviewResponseRate: 60,
        storeRating: 4.5,
        disputes: { pending: 2, processing: 1 },
        avgResponseMinutes: 120,
        reviewTrend: [
          { date: '6/9', returnRate: 2.9, negativeCount: 4 },
          { date: '6/10', returnRate: 3.1, negativeCount: 6 },
          { date: '6/11', returnRate: 2.8, negativeCount: 3 },
          { date: '6/12', returnRate: 3.5, negativeCount: 7 },
          { date: '6/13', returnRate: 3.3, negativeCount: 5 },
          { date: '6/14', returnRate: 3.0, negativeCount: 4 },
          { date: '6/15', returnRate: 3.2, negativeCount: 5 }
        ]
      },
      inventory: {
        totalSkus: 1280,
        lowStockCount: 23,
        slowMovingCount: 156,
        outOfStockCount: 8
      }
    })
};
