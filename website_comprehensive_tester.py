#!/usr/bin/env python3
"""
EXTREME RIGOROUS TESTING SUITE for Bitcoin Bytes Platform
Comprehensive testing of all components, APIs, and functionality
"""

import requests
import json
import time
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
import concurrent.futures
import threading

class BitcoinBytesTestSuite:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'BitcoinBytes-TestSuite/1.0',
            'Accept': 'application/json'
        })
        self.results = {
            'total_tests': 0,
            'passed': 0,
            'failed': 0,
            'warnings': 0,
            'test_details': [],
            'performance_metrics': {},
            'start_time': datetime.now(),
            'end_time': None
        }
        self.critical_endpoints = [
            '/api/bitcoin/price',
            '/api/prices/comparison', 
            '/api/health',
            '/api/news',
            '/api/charts/bitcoin-history'
        ]

    def log_test(self, test_name: str, status: str, details: str, response_time: float = 0):
        """Log test result with detailed information"""
        self.results['total_tests'] += 1
        
        if status == 'PASS':
            self.results['passed'] += 1
            print(f"✅ {test_name}: {details}")
        elif status == 'FAIL':
            self.results['failed'] += 1
            print(f"❌ {test_name}: {details}")
        elif status == 'WARN':
            self.results['warnings'] += 1
            print(f"⚠️  {test_name}: {details}")
        
        self.results['test_details'].append({
            'test': test_name,
            'status': status,
            'details': details,
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        })

    def test_server_connectivity(self):
        """Test basic server connectivity and response"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('overall') in ['healthy', 'degraded']:
                    self.log_test("Server Connectivity", "PASS", 
                                f"Server responding (HTTP {response.status_code}, {response_time:.2f}s)", response_time)
                    return True
                else:
                    self.log_test("Server Connectivity", "FAIL", 
                                f"Server unhealthy: {data.get('overall')}", response_time)
            else:
                self.log_test("Server Connectivity", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}", response_time)
        except Exception as e:
            self.log_test("Server Connectivity", "FAIL", f"Connection error: {str(e)}")
            return False
        return False

    def test_bitcoin_price_accuracy(self):
        """Test Bitcoin price accuracy and validation"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/bitcoin/price", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                price = data.get('bitcoin', {}).get('usd')
                source = data.get('source', 'unknown')
                confidence = data.get('confidence', 0)
                
                # Validate price range (should be between $50k-$200k)
                if price and 50000 <= price <= 200000:
                    # Check if price is in realistic current range
                    if 100000 <= price <= 120000:
                        self.log_test("Bitcoin Price Accuracy", "PASS", 
                                    f"Price ${price:,.0f} from {source} (confidence: {confidence:.2f})", response_time)
                    else:
                        self.log_test("Bitcoin Price Accuracy", "WARN", 
                                    f"Price ${price:,.0f} outside expected range $100K-$120K", response_time)
                else:
                    self.log_test("Bitcoin Price Accuracy", "FAIL", 
                                f"Invalid price: ${price} (outside $50K-$200K range)", response_time)
            else:
                self.log_test("Bitcoin Price Accuracy", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}", response_time)
        except Exception as e:
            self.log_test("Bitcoin Price Accuracy", "FAIL", f"Error: {str(e)}")

    def test_cascade_api_system(self):
        """Test the cascade API system functionality"""
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/bitcoin/cascade-status", timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                cascade = data.get('cascade', {})
                free_sources = data.get('freeSources', {})
                
                active_sources = cascade.get('activeSources', 0)
                total_sources = cascade.get('totalSources', 0)
                emergency_mode = cascade.get('emergencyMode', False)
                
                if active_sources >= 1:
                    if not emergency_mode:
                        self.log_test("Cascade API System", "PASS", 
                                    f"{active_sources}/{total_sources} sources active, normal operation", response_time)
                    else:
                        self.log_test("Cascade API System", "WARN", 
                                    f"Emergency mode active with {active_sources} sources", response_time)
                else:
                    self.log_test("Cascade API System", "FAIL", 
                                f"No active sources available", response_time)
                
                # Test individual free sources
                working_sources = 0
                for source_name, source_data in free_sources.items():
                    if source_data.get('cached'):
                        working_sources += 1
                
                if working_sources >= 3:
                    self.log_test("Free API Sources", "PASS", 
                                f"{working_sources}/{len(free_sources)} sources providing data", response_time)
                else:
                    self.log_test("Free API Sources", "WARN", 
                                f"Only {working_sources}/{len(free_sources)} sources working", response_time)
            else:
                self.log_test("Cascade API System", "FAIL", 
                            f"HTTP {response.status_code}: {response.text}", response_time)
        except Exception as e:
            self.log_test("Cascade API System", "FAIL", f"Error: {str(e)}")

    def test_all_api_endpoints(self):
        """Test all API endpoints for basic functionality"""
        endpoints_to_test = [
            ('/api/prices/comparison', 'Price Comparison'),
            ('/api/news', 'News Feed'),
            ('/api/news/trending', 'Trending News'),
            ('/api/charts/bitcoin-history', 'Historical Charts'),
            ('/api/network/stats', 'Network Statistics'),
            ('/api/market/data', 'Market Data'),
            ('/api/whale/activity', 'Whale Activity'),
            ('/api/ai/intelligence', 'AI Intelligence'),
            ('/api/ai/market-analysis', 'AI Market Analysis'),
            ('/api/ai/price-prediction', 'AI Price Prediction'),
            ('/api/ai/trading-signal', 'AI Trading Signal'),
            ('/api/ai/market-report', 'AI Market Report'),
        ]
        
        def test_endpoint(endpoint_data):
            endpoint, name = endpoint_data
            try:
                start_time = time.time()
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=15)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        if data:  # Non-empty response
                            self.log_test(f"API Endpoint - {name}", "PASS", 
                                        f"Responding with valid data ({response_time:.2f}s)", response_time)
                        else:
                            self.log_test(f"API Endpoint - {name}", "WARN", 
                                        f"Empty response ({response_time:.2f}s)", response_time)
                    except json.JSONDecodeError:
                        self.log_test(f"API Endpoint - {name}", "FAIL", 
                                    f"Invalid JSON response", response_time)
                elif response.status_code == 304:
                    self.log_test(f"API Endpoint - {name}", "PASS", 
                                f"Cached response (HTTP 304, {response_time:.2f}s)", response_time)
                else:
                    self.log_test(f"API Endpoint - {name}", "FAIL", 
                                f"HTTP {response.status_code}: {response.text[:100]}", response_time)
            except Exception as e:
                self.log_test(f"API Endpoint - {name}", "FAIL", f"Error: {str(e)}")
        
        # Test endpoints concurrently for speed
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            executor.map(test_endpoint, endpoints_to_test)

    def test_performance_metrics(self):
        """Test performance of critical endpoints under load"""
        print("\n🔥 PERFORMANCE STRESS TESTING...")
        
        def performance_test(endpoint):
            times = []
            errors = 0
            
            for i in range(10):  # 10 requests per endpoint
                try:
                    start_time = time.time()
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                    response_time = time.time() - start_time
                    
                    if response.status_code in [200, 304]:
                        times.append(response_time)
                    else:
                        errors += 1
                    
                    time.sleep(0.1)  # Small delay between requests
                except:
                    errors += 1
            
            if times:
                avg_time = sum(times) / len(times)
                max_time = max(times)
                min_time = min(times)
                
                if avg_time < 2.0:  # Under 2 seconds average
                    self.log_test(f"Performance - {endpoint}", "PASS", 
                                f"Avg: {avg_time:.2f}s, Max: {max_time:.2f}s, Errors: {errors}/10")
                elif avg_time < 5.0:
                    self.log_test(f"Performance - {endpoint}", "WARN", 
                                f"Slow response - Avg: {avg_time:.2f}s, Max: {max_time:.2f}s")
                else:
                    self.log_test(f"Performance - {endpoint}", "FAIL", 
                                f"Too slow - Avg: {avg_time:.2f}s, Max: {max_time:.2f}s")
                
                self.results['performance_metrics'][endpoint] = {
                    'avg_time': avg_time,
                    'max_time': max_time,
                    'min_time': min_time,
                    'error_rate': errors / 10
                }
            else:
                self.log_test(f"Performance - {endpoint}", "FAIL", 
                            f"All requests failed ({errors}/10 errors)")
        
        # Test critical endpoints
        for endpoint in self.critical_endpoints:
            performance_test(endpoint)

    def test_data_consistency(self):
        """Test data consistency across multiple requests"""
        print("\n🔍 DATA CONSISTENCY TESTING...")
        
        # Test Bitcoin price consistency
        prices = []
        for i in range(5):
            try:
                response = self.session.get(f"{self.base_url}/api/bitcoin/price", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    price = data.get('bitcoin', {}).get('usd')
                    if price:
                        prices.append(price)
                time.sleep(1)
            except:
                pass
        
        if len(prices) >= 3:
            price_variance = (max(prices) - min(prices)) / min(prices) * 100
            if price_variance < 1.0:  # Less than 1% variance
                self.log_test("Price Consistency", "PASS", 
                            f"Price stable across requests (variance: {price_variance:.2f}%)")
            else:
                self.log_test("Price Consistency", "WARN", 
                            f"Price variance {price_variance:.2f}% across requests")
        else:
            self.log_test("Price Consistency", "FAIL", 
                        f"Unable to gather sufficient price data")

    def test_security_headers(self):
        """Test security headers and basic security measures"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            headers = response.headers
            
            security_checks = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': ['DENY', 'SAMEORIGIN'],
                'Content-Security-Policy': None,  # Should exist
                'Strict-Transport-Security': None  # Should exist for HTTPS
            }
            
            security_score = 0
            total_checks = len(security_checks)
            
            for header, expected in security_checks.items():
                if header in headers:
                    if expected is None or headers[header] in (expected if isinstance(expected, list) else [expected]):
                        security_score += 1
                        self.log_test(f"Security Header - {header}", "PASS", 
                                    f"Present: {headers[header]}")
                    else:
                        self.log_test(f"Security Header - {header}", "WARN", 
                                    f"Unexpected value: {headers[header]}")
                else:
                    self.log_test(f"Security Header - {header}", "WARN", 
                                "Header missing")
            
            if security_score >= total_checks * 0.7:
                self.log_test("Overall Security", "PASS", 
                            f"Security headers check passed ({security_score}/{total_checks})")
            else:
                self.log_test("Overall Security", "WARN", 
                            f"Security headers incomplete ({security_score}/{total_checks})")
                
        except Exception as e:
            self.log_test("Security Headers", "FAIL", f"Error checking security: {str(e)}")

    def test_error_handling(self):
        """Test error handling for invalid requests"""
        print("\n🚨 ERROR HANDLING TESTING...")
        
        error_tests = [
            ('/api/nonexistent-endpoint', 404, 'Non-existent Endpoint'),
            ('/api/prices/historical?startDate=invalid', 400, 'Invalid Date Parameter'),
            ('/api/bitcoin/price/emergency-update', 405, 'Invalid HTTP Method'),  # GET instead of POST
        ]
        
        for endpoint, expected_status, test_name in error_tests:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=10)
                if response.status_code == expected_status:
                    self.log_test(f"Error Handling - {test_name}", "PASS", 
                                f"Correct error response (HTTP {response.status_code})")
                else:
                    self.log_test(f"Error Handling - {test_name}", "WARN", 
                                f"Unexpected status: {response.status_code} (expected {expected_status})")
            except Exception as e:
                self.log_test(f"Error Handling - {test_name}", "FAIL", f"Error: {str(e)}")

    def run_all_tests(self):
        """Run the complete test suite"""
        print("🚀 STARTING EXTREME RIGOROUS TESTING SUITE")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_server_connectivity():
            print("❌ CRITICAL: Server not responding. Aborting tests.")
            return self.generate_report()
        
        print("\n💰 BITCOIN PRICING TESTS")
        print("-" * 30)
        self.test_bitcoin_price_accuracy()
        self.test_cascade_api_system()
        self.test_data_consistency()
        
        print("\n🔌 API ENDPOINT TESTS")
        print("-" * 30)
        self.test_all_api_endpoints()
        
        print("\n⚡ PERFORMANCE TESTS")
        print("-" * 30)
        self.test_performance_metrics()
        
        print("\n🔒 SECURITY TESTS")
        print("-" * 30)
        self.test_security_headers()
        self.test_error_handling()
        
        return self.generate_report()

    def generate_report(self):
        """Generate comprehensive test report"""
        self.results['end_time'] = datetime.now()
        duration = (self.results['end_time'] - self.results['start_time']).total_seconds()
        
        print("\n" + "=" * 60)
        print("📊 EXTREME RIGOROUS TESTING REPORT")
        print("=" * 60)
        
        # Summary
        total = self.results['total_tests']
        passed = self.results['passed']
        failed = self.results['failed']
        warnings = self.results['warnings']
        
        pass_rate = (passed / total * 100) if total > 0 else 0
        
        print(f"📈 SUMMARY:")
        print(f"   Total Tests: {total}")
        print(f"   ✅ Passed: {passed} ({pass_rate:.1f}%)")
        print(f"   ❌ Failed: {failed}")
        print(f"   ⚠️  Warnings: {warnings}")
        print(f"   ⏱️  Duration: {duration:.2f} seconds")
        
        # Overall status
        if failed == 0 and warnings <= total * 0.2:  # Less than 20% warnings
            overall_status = "🎉 EXCELLENT - All critical tests passed!"
        elif failed == 0:
            overall_status = "✅ GOOD - All tests passed with some warnings"
        elif failed <= total * 0.1:  # Less than 10% failures
            overall_status = "⚠️  ACCEPTABLE - Minor issues detected"
        else:
            overall_status = "❌ ISSUES DETECTED - Requires attention"
        
        print(f"\n🏆 OVERALL STATUS: {overall_status}")
        
        # Performance summary
        if self.results['performance_metrics']:
            print(f"\n⚡ PERFORMANCE SUMMARY:")
            for endpoint, metrics in self.results['performance_metrics'].items():
                print(f"   {endpoint}: {metrics['avg_time']:.2f}s avg, {metrics['error_rate']:.1%} errors")
        
        # Critical failures
        critical_failures = [test for test in self.results['test_details'] 
                           if test['status'] == 'FAIL' and 'Critical' in test['test']]
        if critical_failures:
            print(f"\n🚨 CRITICAL ISSUES:")
            for failure in critical_failures:
                print(f"   - {failure['test']}: {failure['details']}")
        
        print("\n" + "=" * 60)
        
        # Save detailed report to file
        report_filename = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_filename, 'w') as f:
            json.dump({
                **self.results,
                'start_time': self.results['start_time'].isoformat(),
                'end_time': self.results['end_time'].isoformat()
            }, f, indent=2)
        
        print(f"📄 Detailed report saved to: {report_filename}")
        
        return {
            'overall_status': overall_status,
            'pass_rate': pass_rate,
            'total_tests': total,
            'failed_tests': failed,
            'duration': duration
        }

def main():
    """Main testing function"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:5000"
    
    print(f"🎯 Testing Bitcoin Bytes platform at: {base_url}")
    
    tester = BitcoinBytesTestSuite(base_url)
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results['failed_tests'] > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()