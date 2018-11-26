import Head from 'next/head';
import Header from 'app/components/header';
import Footer from 'app/components/footer';
import styles from 'app/scss/main.scss';

export default ({ children, title = 'Next.js Boilerplate' }) => {
	return (
	    <div className="layout-main">
	        <Head>
	            <title>{ title }</title>
	            <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u' crossOrigin='anonymous'/>
	            <style jsx global>{ styles }</style>
	        </Head>

	        <Header/>
	        { children }
	        <Footer/>
	    </div>
	);
}
